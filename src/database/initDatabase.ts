import { database } from "./database";

export async function initDatabase(){
await database.execAsync(' PRAGMA journal_mode = WAL; PRAGMA foreign_keyss = ON;')
}