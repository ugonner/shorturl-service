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
        type: String,
        unique: true
    })
    shortCode: string;

    @Prop({
        type: String
    })
    createdBy: string;

    @Prop({
        type: Date,
        default: Date.now()
    })
    registeredAt: Date;

    @Prop({
        type: mongoose.Schema.Types.Number,
        default: 0
    })
    numberOfVisits: number;

    @Prop({
        type: mongoose.Schema.Types.Number,
        default: 0
    })
    numberOfFailedRedirects: number;

    @Prop({
        type: mongoose.Schema.Types.Number,
        default: 0
    })
    urlServerDownAtRedirects: number;
}

export const URLStoreSchema = SchemaFactory.createForClass(URLStore);