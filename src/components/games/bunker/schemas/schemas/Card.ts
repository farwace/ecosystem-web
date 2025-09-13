// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 3.0.60
// 

import { Schema, type } from '@colyseus/schema';
import { CardCustomData } from './CardCustomData'

export class Card extends Schema {
    @type("string") public id!: string;
    @type("string") public name!: string;
    @type("string") public type!: string;
    @type("boolean") public active!: boolean;
    @type("string") public maleImageUrl!: string;
    @type("string") public femaleImageUrl!: string;
    @type(CardCustomData) public customData: CardCustomData = new CardCustomData();
    @type("boolean") public isRevealed!: boolean;
    @type("number") public value!: number;
}
