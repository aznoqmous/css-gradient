import App from "./App"

export default class Gradient {
    constructor(){
        this.colorStops = []
        this.colorStopValue = null
        this.fields = {} // additionalFields
        this.position = [new UnitValue(), new UnitValue()]
        this.size = [new UnitValue(100), new UnitValue(100)]
    }

    toCssPosition(){
        return this.position.map(f => f.toCss()).join(' ')
    }
    toCssSize(){
        return this.size.map(f => f.toCss()).join(' ')
    }
}

export class LinearGradient extends Gradient{
    constructor(){
        super()
        this.fields = {
            direction: new DegreeValue()
        }
        this.colorStopValue = UnitValue
    }

    toCss(){
        let colorStops = this.colorStops.map(c => c.toCss()).join(', ')
        colorStops = colorStops ? ', ' + colorStops : "";
        return `linear-gradient(${this.fields.direction.toCss()}${colorStops})`
    }
}

export class RadialGradient extends Gradient {
    constructor(){
        super()
        this.position = [new UnitValue(50), new UnitValue(50)]
        this.fields = {
            shape: new SelectValue("", ["", "circle"])
        }
        this.colorStopValue = UnitValue
    }
    toCss(){
        let colorStops = this.colorStops.map(c => c.toCss()).join(', ')
        colorStops = colorStops ? ', ' + colorStops : "";
        let position = this.toCssPosition()
        return `radial-gradient(${this.fields.shape.toCss()} at ${position}${colorStops})`
    }
}

export class ConicGradient {
    constructor(){

    }
}

export class Value extends EventTarget {
    constructor(value=0){
        super()
        this.value = value
    }
    toCss(){
        return this.value
    }

    buildForm(container){
        let form = App.createElement('div', {}, container)
        this.createFields(form)
        form.querySelectorAll('input,select').forEach(input => input.addEventListener('input', ()=>{
            this.updateValue()
            this.dispatchEvent(new CustomEvent('update'))
        }))
        return form
    }

    createFields(form){
        this.input = App.createElement('input', {value: this.value}, form)
    }
    updateValue(){
        this.value = this.input.value
    }
}

export class ColorValue extends Value {}

export class ColorStop extends Value {
    constructor(color="#fff", stopValue=null){
        super()
        this.color = new ColorValue(color)
        this.stopValue = stopValue
    }
    createFields(form){
        form.className = "color-stop"
        this.color.buildForm(form)
        if(this.stopValue) this.stopValue.buildForm(form)
    }
    toCss(){
        return this.color.toCss() + (this.stopValue ? " " + this.stopValue.toCss() : "")
    }
    updateValue(){
    }
}



export class DegreeValue extends Value {
    createFields(form){
        this.input = App.createElement('input', {
            type: "number",
            value: this.value,
            min: -180,
            max: 180
        }, form)
    }
    toCss(){
        return this.value + "deg"
    }
}

export class SelectValue extends Value {
    constructor(value, units=[]){
        super(value)
        this.units = units
    }
    createFields(form){
        this.input = App.createElement("select", {}, form)
        this.units.map(unit => this.input.appendChild(new Option(unit)))
    }
    updateValue(){
        this.value = this.input.value
    }
}

export class UnitValue extends Value {
    constructor(value=0, units=null){
        super()
        this.value = value
        this.units = units || ["%", "px","rem"]
        this.unit = this.units[0]
    }
    createFields(form){
        this.input = App.createElement('input', {
            type: "number",
            value: this.value,
        }, form)
        this.inputUnit = App.createElement("select", {}, form)
        this.units.map(unit => this.inputUnit.appendChild(new Option(unit)))
    }
    updateValue(){
        this.value = this.input.value
        this.unit = this.inputUnit.value
    }
    toCss(){
        return this.value + this.unit
    }
}