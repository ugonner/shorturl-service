export interface IURLData{
    originalUrl: string;
    shortUrl: string;
    shortCode: string;
    createdBy?: string;
    registeredAt?: Date;
    originalUrlStatus?: "down" | "up";
}

export interface IURLStatics extends IURLData{
    shortCode: string;
    createdAt?: string;
    numberOfVisits: number;
    numberOfFailedRedirects: number;
    urlServerDownAtRedirects: number;
}