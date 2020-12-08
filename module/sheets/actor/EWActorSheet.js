export class EWActorSheet extends ActorSheet {

    get template() {
        return "systems/ewhen/templates/sheets/actor/EWActorSheet.hbs"
    }

    getData () {
        const data = super.getData();

        data.config = CONFIG.ewhen; 
        
        return data;
    }
}