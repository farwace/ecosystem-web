// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 3.0.60
// 

import { Schema, type, ArraySchema} from '@colyseus/schema';
import { Card } from './Card'

export class Scenario extends Schema {
    @type("string") public id!: string;
    @type("string") public name!: string;
    @type("string") public description!: string;
    @type("string") public imageUrl!: string;
    @type([ Card ]) public cardsProfession: ArraySchema<Card> = new ArraySchema<Card>();
    @type([ Card ]) public cardsAge: ArraySchema<Card> = new ArraySchema<Card>();
    @type([ Card ]) public cardsHealth: ArraySchema<Card> = new ArraySchema<Card>();
    @type([ Card ]) public cardsCharacteristic: ArraySchema<Card> = new ArraySchema<Card>();
    @type([ Card ]) public cardsAdditionalInformation: ArraySchema<Card> = new ArraySchema<Card>();
    @type([ Card ]) public cardsPhobias: ArraySchema<Card> = new ArraySchema<Card>();
    @type([ Card ]) public cardsSkills: ArraySchema<Card> = new ArraySchema<Card>();
    @type([ Card ]) public cardsLuggage: ArraySchema<Card> = new ArraySchema<Card>();
}
