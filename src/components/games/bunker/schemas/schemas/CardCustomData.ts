// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 3.0.60
// 

import { Schema, type } from '@colyseus/schema';


export class CardCustomData extends Schema {
    @type("number") public from!: number;
    @type("number") public to!: number;
    @type("number") public value!: number;
}
