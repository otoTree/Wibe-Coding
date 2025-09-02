// 导入日志功能（当前被注释掉，可能用于调试或生产环境的日志记录）
//import { addLog } from '../system/log';

// 从当前目录的index文件导入MongoDB连接实例和ClientSession类型定义
// connectionMongo: MongoDB连接实例，用于创建会话
// ClientSession: MongoDB会话的TypeScript类型定义
import { connectionMongo, type ClientSession } from './index';

// 定义事务超时时间为60秒（60000毫秒）
// 这个超时时间用于控制MongoDB事务的最大提交时间
const timeout = 60000;

// 导出一个异步函数mongoSessionRun，用于在MongoDB事务中执行操作
// 使用泛型T来确保返回值类型的灵活性，默认为unknown类型
// 参数fn是一个接收ClientSession并返回Promise<T>的函数
export const mongoSessionRun = async <T = unknown>(fn: (session: ClientSession) => Promise<T>) => {
  // 通过MongoDB连接实例启动一个新的会话
  // 会话是MongoDB中进行事务操作的基础单位
  const session = await connectionMongo.startSession();

  try {
    // 开始一个新的事务
    // maxCommitTimeMS: 设置事务提交的最大超时时间
    // 如果事务在指定时间内无法提交，将会自动中止
    session.startTransaction({
      maxCommitTimeMS: timeout
    });
    
    // 执行传入的函数，将当前会话作为参数传递
    // 这里是实际的业务逻辑执行部分
    const result = await fn(session);

    // 如果函数执行成功，提交事务
    // 提交后，所有在此事务中的数据库操作将被永久保存
    await session.commitTransaction();

    // 返回函数执行的结果，并确保类型为T
    return result as T;
  } catch (error) {
    // 异常处理：如果在执行过程中发生错误
    
    // 检查事务是否已经提交
    // 如果事务尚未提交，则中止事务以回滚所有操作
    if (!session.transaction.isCommitted) {
      await session.abortTransaction();
    } else {
      // 如果事务已经提交但仍然出现错误，记录警告日志
      // 这种情况比较少见，通常发生在提交后的清理阶段
      //addLog.warn('Un catch mongo session error', { error });
    }
    
    // 重新抛出错误，让调用方能够处理
    return Promise.reject(error);
  } finally {
    // 无论成功还是失败，都要结束会话以释放资源
    // 这是清理工作，确保不会造成连接泄漏
    await session.endSession();
  }
};
