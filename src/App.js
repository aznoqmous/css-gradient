import { ColorStop, LinearGradient, RadialGradient } from "./Gradient"

export default class App {
    constructor(){
        this.build()
        this.bind()
    }

    build(){
        this.gradients = []
        this.container = document.getElementById('app')
        this.gradientTypes = [
            LinearGradient,
            RadialGradient
        ]
        this.gradientTypeSelect = this.container.querySelector('[name="gradientType"')
        this.gradientTypes.map(type => {
            this.gradientTypeSelect.appendChild(new Option(type.name, type.name))
        })

        this.addGradientButton = this.container.querySelector("#addGradient")
        this.gradientContainer = this.container.querySelector(".gradients")
    
        this.pattern = this.container.querySelector('#pattern .preview')
        this.result = this.container.querySelector('#result .preview')

    }
    
    bind(){
        this.addGradientButton.addEventListener('click', ()=>{
            this.addGradient(this.gradientTypes.filter(t => t.name == this.gradientTypeSelect.value)[0])
        })
    }

    addGradient(gradientType){
        let gradient = new gradientType()
        let element = App.createElement('div', {className: "gradient"}, this.gradientContainer)
        let preview = App.createElement('figure', {className: "preview"}, element)
        let name = App.createElement("strong", {innerHTML: gradientType.name}, element)
        let deleteButton = App.createElement("button", {innerHTML: "Delete"}, name)
        deleteButton.addEventListener('click', ()=>{
            this.gradients.splice(this.gradients.indexOf(gradient), 1)
            element.remove()
            this.update()
        })
        let container = App.createElement("div", {className: "gradient-container"}, element)
        // additional fields
        Object.values(gradient.fields).map(f => {
            f.addEventListener('update', ()=> {
                this.updatePreview(gradient, preview)
                this.update()
            })
            f.buildForm(container)
        })

        // color stops 
        let colorStopsContainer = App.createElement("ul", { className: "color-stops" }, container)
        let addColorStopButton = App.createElement("button", {className: "addColorStop", innerHTML: "Add color stop"}, container)
        addColorStopButton.addEventListener('click', ()=>{
            let colorStop = new ColorStop("#fff", new gradient.colorStopValue())
            colorStop.buildForm(colorStopsContainer)
            gradient.colorStops.push(colorStop)
            colorStop.addEventListener('update', ()=> {
                this.updatePreview(gradient, preview)
                this.update()
            })
        })

        // position
        let positionSize = App.createElement('div', {className: "position-size"}, container)
        let position = App.createElement('div', {className: "position"}, positionSize)
        App.createElement("div", {innerHTML: "position"}, position)
        gradient.position.map(v => {
            v.buildForm(position)
            v.addEventListener('update', ()=> {
                this.updatePreview(gradient, preview)
                this.update()
            })
        })
        let size = App.createElement('div', {className: "size"}, positionSize)
        App.createElement("div", {innerHTML: "size"}, size)
        gradient.size.map(v => {
            v.buildForm(size)
            v.addEventListener('update', ()=> {
                this.updatePreview(gradient, preview)
                this.update()
            })
        })

        this.gradients.push(gradient)
    }

    update(){
        let gradientStyle = this.gradients.map(gradient => gradient.toCss()).join(',')
        this.pattern.style.backgroundImage = gradientStyle
        this.result.style.backgroundImage = gradientStyle

        let gradientPosition = this.gradients.map(gradient => gradient.toCssPosition()).join(',')
        this.pattern.style.backgroundPosition = gradientPosition
        this.result.style.backgroundPosition = gradientPosition

        let gradientSize = this.gradients.map(gradient => gradient.toCssSize()).join(',')
        this.result.style.backgroundSize = gradientSize
    }

    updatePreview(gradient, element){
        element.style.backgroundImage = gradient.toCss()
        element.style.backgroundPosition = gradient.toCssPosition()
        element.style.backgroundSize = gradient.toCssSize()
    }

    static createElement(tagName="div", attr={}, parent=null){
        let element = document.createElement(tagName)
        for(let key in attr) element[key] = attr[key]
        if(parent) parent.appendChild(element)
        return element
    }

    
}