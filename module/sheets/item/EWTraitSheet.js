export default class EWTraitSheet extends ItemSheet {

    get template() {
        return "systems/ewhen/templates/item/EWTraitSheet.hbs"
    }

    getData() {
        const data = super.getData();

        data.config = CONFIG.ewhen;

        return data;
    }
}