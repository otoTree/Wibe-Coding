import type {Mongoose} from 'mongoose'

declare global{
    var mongodb: Mongoose | undefined
}
