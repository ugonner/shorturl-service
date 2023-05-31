import {IsUrl, IsString } from "class-validator";

export class URLDto{
    @IsUrl()
    @IsString()
    url: string;
}