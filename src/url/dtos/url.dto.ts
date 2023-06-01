import {IsUrl, IsString } from "class-validator";

export class EncodeURLDto{
    @IsUrl()
    url: string;
}