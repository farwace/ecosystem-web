// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 3.0.60
// 

import { Schema, type, ArraySchema, MapSchema } from '@colyseus/schema';
import { Player } from './Player'
import { Scenario } from './Scenario'

export class BunkerGameRoomState extends Schema {
    @type("string") public status!: string;
    @type("string") public gameStage!: string;
    @type("boolean") public isPrivateRoom!: boolean;
    @type("number") public hostId!: number;
    @type("string") public currentSpeakerId!: string;
    @type("number") public minPlayers!: number;
    @type("number") public maxPlayers!: number;
    @type("number") public playersCount!: number;
    @type({ map: "number" }) public places: MapSchema<number> = new MapSchema<number>();
    @type({ map: Player }) public players: MapSchema<Player> = new MapSchema<Player>();
    @type([ "string" ]) public eliminatedPlayers: ArraySchema<string> = new ArraySchema<string>();
    @type([ "string" ]) public disconnectedPlayers: ArraySchema<string> = new ArraySchema<string>();
    @type(Scenario) public scenario: Scenario = new Scenario();
    @type("number") public currentRound!: number;
    @type("number") public maxRounds!: number;
    @type("number") public turnTimeLimit!: number;
    @type("number") public turnTimeRemaining!: number;
    @type([ "string" ]) public votingResults: ArraySchema<string> = new ArraySchema<string>();
    @type([ "string" ]) public activeCardTypes: ArraySchema<string> = new ArraySchema<string>();
}
