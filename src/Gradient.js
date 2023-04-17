import App from "./App"

export default class Gradient {
    constructor(cssName=""){
        this.cssName = cssName
        this.colorStops = []
        this.colorStopValue = null
        this.fields = {} // additionalFields
        this.position = [new UnitValue("x"), new UnitValue("y")]
        this.size = [new UnitValue("width", 100), new UnitValue("height", 100)]
    }

    clone(){
        let newGradient = new this.constructor()
        newGradient.fromCss(this.toCss())
        newGradient.fromCssPosition(this.toCssPosition())
        newGradient.fromCssSize(this.toCssSize())
        return newGradient
    }

    toCssPosition(){
        return this.position.map(f => f.toCss()).join(' ')
    }
    toCssSize(){
        return this.size.map(f => f.toCss()).join(' ')
    }

    toCss(){
        return `${this.cssName}()`
    }

    addColorStop(){
        let cs = new ColorStop("", "", new this.colorStopValue())
        this.colorStops.push(cs)
        return cs
    }

    static fromCss(cssString){
        let gradients = Gradients.map(g => new g())
        let matches = gradients.filter(g => cssString.match(g.cssName))
        if(!matches) return null;
        let gradient = matches[0]
        return gradient.fromCss(cssString)
    }
    
    fromCss(cssValue){
        /*  */
    }

    fromCssPosition(cssPosition){
        this.position[0].fromCss(cssPosition.split(' ')[0])
        this.position[1].fromCss(cssPosition.split(' ')[1])
    }
    fromCssSize(cssSize){
        this.size[0].fromCss(cssSize.split(' ')[0])
        this.size[1].fromCss(cssSize.split(' ')[1])
    }
}

export class LinearGradient extends Gradient{
    constructor(){
        super("linear-gradient")
        this.fields = {
            direction: new DegreeValue("direction")
        }
        this.colorStopValue = UnitValue
    }

    toCss(){
        let colorStops = this.colorStops.map(c => c.toCss()).join(', ')
        colorStops = colorStops ? ', ' + colorStops : "";
        return `${this.cssName}(${this.fields.direction.toCss()}${colorStops})`
    }

    fromCss(cssValue){
        cssValue = cssValue.replace(/^[^\(]*?\(/, "").replace(/\)$/, "")
        let values = cssValue.replace(/([^0-9\.]),/g, "$1___").split("___")

        this.fields.direction.fromCss(values[0])
        values.shift()
        values.map(value => {
            let cs = this.addColorStop()
            cs.fromCss(value)
        })
        return this
    }
}

export class RadialGradient extends Gradient {
    constructor(){
        super("radial-gradient")
        this.position = [new UnitValue("x", 50), new UnitValue("y", 50)]
        this.fields = {
            shape: new SelectValue("shape", "", ["", "circle"]),
            positionX: new UnitValue("x", 50),
            positionY: new UnitValue("y", 50),
        }
        this.colorStopValue = UnitValue
    }
    toCss(){
        let colorStops = this.colorStops.map(c => c.toCss()).join(', ')
        colorStops = colorStops ? ', ' + colorStops : "";
        let position = this.fields.positionX.toCss()  + " " + this.fields.positionY.toCss()
        return `${this.cssName}(${this.fields.shape.toCss()} at ${position}${colorStops})`
    }

    fromCss(cssValue){
        cssValue = cssValue.replace(/^[^\(]*?\(/, "").replace(/\)$/, "")
        let values = cssValue.replace(/([^0-9\.]),/g, "$1___").split("___")
        let shapeAndPosition = values[0]
        let shape = shapeAndPosition.split(" at ")[0]
        let position = shapeAndPosition.split(" at ")[1]
        this.fields.shape.fromCss(shape)
        this.fields.positionX.fromCss(position.split(" ")[0])
        this.fields.positionY.fromCss(position.split(" ")[1])
        values.shift()
        values.map(value => {
            let cs = this.addColorStop()
            cs.fromCss(value)
        })
        return this
    }
}

export class ConicGradient extends Gradient {
    constructor(){
        super("conic-gradient")
        this.position = [new UnitValue("x", 50), new UnitValue("y", 50)]
        this.fields = {
            from: new DegreeValue("from", 0),
            positionX: new UnitValue("x", 50),
            positionY: new UnitValue("y", 50),
        }
        this.colorStopValue = DegreeValue
    }

    toCss(){
        let colorStops = this.colorStops.map(c => c.toCss()).join(', ')
        colorStops = colorStops ? ', ' + colorStops : "";
        let position = this.fields.positionX.toCss()  + " " + this.fields.positionY.toCss()
        return `${this.cssName}(from ${this.fields.from.toCss()} at ${position}${colorStops})`
    }

    fromCss(cssValue){
        cssValue = cssValue.replace(/^[^\(]*?\(/, "").replace(/\)$/, "")
        let values = cssValue.replace(/([^0-9\.]),/g, "$1___").split("___")
        let fromAndPosition = values[0]
        let from = fromAndPosition.split(' at ')[0].replace(/^from /, "").trim()
        let position = fromAndPosition.split(' at ')[1]
        this.fields.from.fromCss(from)
        this.fields.positionX.fromCss(position.split(" ")[0])
        this.fields.positionY.fromCss(position.split(" ")[1])
        values.shift()
        values.map(value => {
            let cs = this.addColorStop()
            cs.fromCss(value)
        })
        return this
    }
}

export class Value extends EventTarget {
    constructor(label="", value=0){
        super()
        this.label = label
        this.value = value
        this.slideControl = false 
    }
    toCss(){
        return this.value
    }

    buildForm(container){
        let form = App.createElement('div', {className: "form"}, container)
        if(this.label) this.createLabel(form)
        this.createFields(form)
        form.querySelectorAll('input,select').forEach(input => input.addEventListener('input', ()=>{
            this.updateValue()
            this.dispatchEvent(new CustomEvent('update'))
        }))
        return form
    }

    createFields(form){
        this.input = App.createElement('input', {value: this.value, step: 0.1}, form)
    }

    createLabel(form){
        this.label = App.createElement('span', {innerHTML: this.label, className: this.slideControl ? "slide-control" : ""}, form)
        if(this.slideControl){
            let mouseX = null
            let startValue = null
            const bindMouseMove = (e)=>{
                this.value = startValue + (e.pageX - mouseX) * (this.input.step || 1)
                this.value = this.value.toFixed(1)
                this.input.value = this.value
                this.dispatchEvent(new CustomEvent('update'))
            }
            this.label.addEventListener('mousedown', (e)=>{
                mouseX = e.pageX
                startValue = parseFloat(this.value)
                window.addEventListener('mousemove', bindMouseMove)
                window.addEventListener('mouseup', ()=> window.removeEventListener("mousemove", bindMouseMove))
                window.addEventListener('mouseleave', ()=> window.removeEventListener("mousemove", bindMouseMove))
            })

        }
    }

    updateValue(){
        this.value = this.input.value
    }

    fromCss(value){
        this.value = value
    }
}

export class ColorValue extends Value {
    createFields(form){
        this.preview = App.createElement('figure', {className: "color-preview"}, form)
        super.createFields(form)
        this.preview.style.background = this.input.value
        this.addEventListener('update', ()=>{
            this.preview.style.background = this.input.value
        })
    }
}

export class ColorStop extends Value {
    constructor(label, color="#fff", stopValue=null){
        super(label, color)
        this.color = new ColorValue("", color)
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

    fromCss(cssValue){
        cssValue = cssValue.replace(/, /g, ",")
        let values = cssValue.trim().split(" ")
        this.color.fromCss(values[0])
        this.stopValue.fromCss(values[1])
    }

    clone(){
        return new ColorStop(this.label, this.color.value, this.stopValue)
    }
}



export class DegreeValue extends Value {
    constructor(label, value){
        super(label, value)
        this.slideControl = true
    }
    createFields(form){
        this.input = App.createElement('input', {
            type: "number",
            value: this.value,
            min: -180,
            max: 180,
            step: 0.1
        }, form)
    }
    toCss(){
        return this.value + "deg"
    }
    fromCss(cssValue){
        this.value = parseFloat(cssValue)
    }
}

export class SelectValue extends Value {
    constructor(label, value, units=[]){
        super(label, value)
        this.units = units
    }
    createFields(form){
        this.input = App.createElement("select", {}, form)
        this.units.map(unit => this.input.appendChild(new Option(unit, unit, unit == this.unit, unit == this.unit)))
    }
    updateValue(){
        this.value = this.input.value
    }
}

export class UnitValue extends Value {
    constructor(label, value=0, units=null){
        super(label, value)
        this.value = value
        this.units = units || ["%", "px","rem"]
        this.unit = this.units[0]
        this.slideControl = true
    }
    createFields(form){
        this.input = App.createElement('input', {
            type: "number",
            value: this.value,
            step: 0.1
        }, form)
        this.inputUnit = App.createElement("select", {}, form)
        this.units.map(unit => this.inputUnit.appendChild(new Option(unit, unit, unit == this.unit, unit == this.unit)))
    }
    updateValue(){
        this.value = this.input.value
        this.unit = this.inputUnit.value
    }
    toCss(){
        return this.value + this.unit
    }
    fromCss(css){
        this.value = parseFloat(css)
        this.unit = css.match(/[a-z%]/g).join('')
    }
}

export const Gradients = [
    LinearGradient,
    RadialGradient,
    ConicGradient
]