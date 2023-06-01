import {IsUrl, IsString } from "class-validator";

export class EncodeURLDto{
    @IsUrl()
    url: string;
}
export class DecodeURLDto{
    @IsString()
    shortCode: string;
}