import {Prop, SchemaFactory, Schema } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose';

export type URLStoreDocument = URLStore & Document;

@Schema({timestamps: true})
export class URLStore{
    @Prop({
        type: String,
        unique: true
    })
    originalUrl: string;

    @Prop({
        type: String,
        unique: true
    })
    shortUrl: string;

    @Prop({
        type: mongoose.Schema.Types.Number,
        default: 0
    })
    numberOfVisits: 0

    @Prop({
        type: mongoose.Schema.Types.Number,
        default: 0
    })
    numberOfFailedRedirects: 0
}

export const URLStoreSchema = SchemaFactory.createForClass(URLStore);