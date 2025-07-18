import type {TAgeGroup} from "@/stores/Ecosystem/IEcosystemStore";
import {AgeGroup} from "@/stores/Ecosystem/IEcosystemStore";

export const getAgeGroup = (age?:number):TAgeGroup => {
    if(!age){
        return AgeGroup['zoomer'];
    }
    if(age > 17 && age < 25){
        return AgeGroup['millenial'];
    }
    if(age > 24 && age < 35){
        return AgeGroup['doomer'];
    }
    if(age >= 35){
        return AgeGroup['boomer'];
    }
    return AgeGroup['zoomer'];
}