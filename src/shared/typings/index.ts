export interface IURLData{
    originalUrl: string;
    shortUrl: string;
    shortCode: string;
    createdBy?: string;
    registeredAt?: Date;
    originalUrlStatus?: "down" | "up",
    urlServerDownAtRedirects?: number
}

export interface IURLStatics extends IURLData{
    numberOfVisits: number;
    numberOfFailedRedirects: number;
    urlServerDownAtRedirects: number;
}