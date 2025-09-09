import {ArraySchema, type} from "@colyseus/schema";
import {Card} from "@/components/games/bunker/schemas/schemas/Card.ts";

export type TGameStage = "introduction" | "card_reveal" | "voting" | "results";
export type TRoomStatus = "waiting" | "starting" | "playing" | "finished";

export type TPlayer = {
    id: number;
    name: string;
    sessionId: string;
    isConnected: boolean;
    isReady: boolean;
    canSpeak: boolean;
    isEliminated: boolean;
    experience: number;
    level: number;
    popularity: number;
    popularityLevel: number;
    isMale: boolean;
    isVip: boolean;
    isPremium: boolean;
    avatar: string;
    age: string;
    votesAgainst: number;

    cards: ArraySchema<Card>;//todo: упростить тип
    revealedCards: ArraySchema<Card>;//todo: упростить тип
}