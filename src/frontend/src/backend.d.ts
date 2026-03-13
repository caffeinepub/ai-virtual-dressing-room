import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ClothingItem {
    id: bigint;
    name: string;
    imageUrl: string;
    category: string;
}
export interface backendInterface {
    getAllItems(): Promise<Array<ClothingItem>>;
    getItemById(id: bigint): Promise<ClothingItem>;
    getItemsByCategory(category: string): Promise<Array<ClothingItem>>;
}
