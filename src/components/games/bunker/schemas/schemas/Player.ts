// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 3.0.60
// 

import { Schema, type, ArraySchema } from '@colyseus/schema';
import { Card } from './Card'

export class Player extends Schema {
    @type("number") public id!: number;
    @type("string") public name!: string;
    @type("string") public sessionId!: string;
    @type("boolean") public isConnected!: boolean;
    @type("boolean") public isReady!: boolean;
    @type("boolean") public canSpeak!: boolean;
    @type("boolean") public isEliminated!: boolean;
    @type("boolean") public isBot!: boolean;
    @type([ Card ]) public cards: ArraySchema<Card> = new ArraySchema<Card>();
    @type([ Card ]) public revealedCards: ArraySchema<Card> = new ArraySchema<Card>();
    @type("number") public experience!: number;
    @type("number") public level!: number;
    @type("number") public popularity!: number;
    @type("number") public popularityLevel!: number;
    @type("boolean") public isMale!: boolean;
    @type("boolean") public isVip!: boolean;
    @type("boolean") public isPremium!: boolean;
    @type("string") public avatar!: string;
    @type("number") public votesAgainst!: number;
}
