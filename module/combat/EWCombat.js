import { DICE_MODELS, DEFAULT_DICE_MODEL, getDiceModel } from '../diceModels.js'

export class EWCombat extends Combat {

    constructor(...args) {
        super(...args);
    }

    /**
     * @override
     */

    startCombat() {
        let updateDiffs = new Array();
        if(game.settings.get("ewhen", "initType") === "EWhenPriority") {
            this.combatants.forEach(combatant => {
                let adjInit = this.convertInitiative(combatant);
                let diff = {_id:combatant._id, "data.initiative":adjInit, "initiative":adjInit};
                updateDiffs.push(diff);
                // combatant.update({"initiative":adjInit, "data.initiative":adjInit});
            });
            // console.warn("Priority List Array: ", priorityList);
            this.updateEmbeddedDocuments("Combatant",  updateDiffs);
            super.startCombat();
        } else {
            super.startCombat();
        }
    }
     /**
     * @override
     */
    nextRound(){
        super.nextRound();
        if(!game.settings.get("ewhen", "rerollPerRound")) { return; }
        let rrlist = new Array();
        let updateDiffs = new Array();

        console.warn("Combatants: ", this.combatants);



        if(game.settings.get("ewhen", "initType") === "EWhenPriority") {
            this.combatants.forEach(combatant => {
                let adjInit = this.convertInitiative(combatant);
                let diff = {_id:combatant._id, "data.initiative":adjInit, "initiative":adjInit};
                updateDiffs.push(diff);
                // combatant.update({"initiative":adjInit, "data.initiative":adjInit});
            });
            // console.warn("Priority List Array: ", priorityList);
            this.updateEmbeddedDocuments("Combatant",  updateDiffs);
        } else {
            for (let c of this.combatants) {
                rrlist.push(c.id);
            }
            this.rollInitiative(rrlist);
        }
    }

    /**
     * Converts initiative from rolled initiative to Priority Ladder position
     * @param {Combatant} com - combatant object drawn from the current combat
     */
    convertInitiative(com, init) {

        if(game.settings.get("ewhen", "initType") != "EWhenPriority") { return; }

        const diceModel = getDiceModel(game)

        var adjInit = 0;
        var isPC;
        console.log("Combatant in convertInit: ", com);
        let initRoll = com.data.initiative;
        let actorId = com.data.actorId;
        let actor = game.actors.get(actorId);
        let initExpr = actor.data.data.priority_roll.expression;
        let initiative = new Roll(initExpr).evaluate({async:false});
        let initRoll = initiative.total;
        let name = actor.name;
        let isRival = actor.data.data.isRival;
        let isTough = actor.data.data.isTough;
        let isRabble = actor.data.data.isRabble;

        if(!isRival && !isTough && !isRabble) { isPC = true; } else { isPC = false; }

        let mnd = actor.getAttribute("mind").rank;
        let ini = actor.getAttribute("initiative").rank;
        let diceOnly = initRoll - mnd - ini;

        if(!isPC){
        // todo - work on Rivals with "Diabolical Plan" feat;
            if (isRival) { adjInit = 5; }
            if (isTough) { adjInit = 4; }
            if (isRabble) { adjInit = 2; }

        }

      //  console.log(name, " isPC: ", isPC);;

        if (isPC) {
            if(diceOnly >= diceModel.success) {
                // mighty success; initiative = 8
                adjInit = 8;
            } else if (initRoll >= diceModel.tn && diceOnly < diceModel.success && diceOnly > diceModel.failure) {
                // regular success; initiative = 6
                adjInit = 6;
            } else if (initRoll < diceModel.tn && diceOnly < diceModel.success && diceOnly > diceModel.failure) {
                // regular failure; initiative = 3
                adjInit = 3;
            } else if (diceOnly <= diceModel.failure) {
                // calam failure, initiative = 1
                adjInit = 1;
            }
        }
      console.warn("Combatant: ", com.name);
      console.warn("Init Expression: ", initExpr);
      console.warn("Incoming Init Roll: ", initiative, initRoll, typeof(initRoll));
      console.warn("Adjusted Init Roll: ", adjInit);

      return adjInit;

    }

}
