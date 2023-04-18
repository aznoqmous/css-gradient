import Gradient, { ColorStop, Gradients } from "./Gradient"

export default class App {
    constructor(){
        this.build()
        this.bind()
    }

    build(){
        this.gradients = []
        this.container = document.getElementById('app')
        this.gradientTypes = Gradients
        this.gradientTypeSelect = this.container.querySelector('[name="gradientType"')

        /*this.gradientTypes.map(type => {
            this.gradientTypeSelect.appendChild(new Option(type.name, type.name))
        })*/

        Shapes.map(shape => {
            this.gradientTypeSelect.appendChild(new Option(shape.name, shape.name))
        })

        this.addGradientButton = this.container.querySelector("#addGradient")
        this.gradientContainer = this.container.querySelector(".gradients")
    
        this.pattern = this.container.querySelector('#pattern .preview')
        this.result = this.container.querySelector('#result .preview')

        this.codePreview = this.container.querySelector("#result code")

    }
    
    bind(){
        this.addGradientButton.addEventListener('click', ()=>{
            //this.newGradient(this.gradientTypes.filter(t => t.name == this.gradientTypeSelect.value)[0])
            let shape = Shapes.filter(t => t.name == this.gradientTypeSelect.value)[0]
            this.fromCss(shape.css)
        })
    }

    fromCss(css){
        let properties = Object.fromEntries(
            css
            .replace(/\r/g, " ")
            .replace(/\n/g, " ")
            .replace(/  /g, " ")
            .split(";")
            .map(str => str.trim())
            .filter(v => v)
            .map(v => [v.split(':')[0].trim(), v.split(':')[1].trim()])
        )
        properties['background-image'] = properties['background-image'] ? properties['background-image'] : properties['background']
        properties['background-size'] = properties['background-size'] ? properties['background-size'].split(',') : []
        properties['background-position'] = properties['background-position'] ? properties['background-position'].split(',') : []
        properties['background-image'] = properties['background-image'] ? properties['background-image'].replace(/\),/g, ")###").split('###').map(v => v.trim()) : []     
        let backgroundPosition = "0% 0%"
        let backgroundSize = "100% 100%"
        properties['background-image'].map((gradientCss, i)=> {
            if(properties['background-position'] && properties['background-position'][i]) backgroundPosition = properties['background-position'][i]
            if(properties['background-size'] && properties['background-size'][i]) backgroundSize = properties['background-size'][i]
            let gradient = Gradient.fromCss(gradientCss)
            gradient.fromCssSize(backgroundSize);
            gradient.fromCssPosition(backgroundPosition);
            let element = this.addGradient(gradient)
            element.classList.toggle('hidden')
        })
    }

    newGradient(gradientType){
        let gradient = new gradientType()
        this.addGradient(gradient)
    }
    addGradient(gradient){
        let gradientType = gradient.constructor
        let element = App.createElement('div', {className: "gradient"}, this.gradientContainer)
        
        let head = App.createElement('div', {className: "head"}, element)
        let preview = App.createElement('figure', {className: "preview"}, head)
        let pattern = App.createElement('figure', {className: "pattern"}, head)
        let name = App.createElement("strong", {innerHTML: gradientType.name}, head)
        head.addEventListener('click', (e)=>{
            if(e.target.tagName == "BUTTON") return;
            element.classList.toggle('hidden')
        })

        let deleteButton = App.createElement("button", {innerHTML: "Remove"}, head)
        deleteButton.addEventListener('click', ()=>{
            this.gradients.splice(this.gradients.indexOf(gradient), 1)
            element.remove()
            this.update()
        })
        let duplicateButton = App.createElement("button", {innerHTML: "Duplicate"}, head)
        duplicateButton.addEventListener('click', ()=>{
            let newGradient = gradient.clone()
            this.addGradient(newGradient)
        })

        let container = App.createElement("div", {className: "gradient-container"}, element)
        // additional fields
        Object.values(gradient.fields).map(f => {
            f.buildForm(container)
            f.addEventListener('update', ()=> {
                this.updatePreview(gradient, preview, pattern)
                this.update()
            })
        })

        // color stops 
        let colorStopsContainer = App.createElement("ul", { className: "color-stops" }, container)
        let addColorStopButton = App.createElement("button", {className: "addColorStop", innerHTML: "Add color stop"}, container)
        addColorStopButton.addEventListener('click', ()=>{
            let colorStop = new ColorStop("", "#fff", new gradient.colorStopValue())
            gradient.colorStops.push(colorStop)
            this.addColorStop(colorStop, colorStopsContainer, gradient, preview, pattern)
        })
        gradient.colorStops.map(cs => this.addColorStop(cs, colorStopsContainer, gradient, preview, pattern))

        // position
        let positionSize = App.createElement('div', {className: "position-size"}, container)
        let position = App.createElement('div', {className: "position"}, positionSize)
        App.createElement("div", {innerHTML: "position"}, position)
        gradient.position.map(v => {
            v.buildForm(position)
            v.addEventListener('update', ()=> {
                this.updatePreview(gradient, preview, pattern)
                this.update()
            })
        })
        let size = App.createElement('div', {className: "size"}, positionSize)
        App.createElement("div", {innerHTML: "size"}, size)
        gradient.size.map(v => {
            v.buildForm(size)
            v.addEventListener('update', ()=> {
                this.updatePreview(gradient, preview, pattern)
                this.update()
            })
        })

        this.gradients.push(gradient)
        this.updatePreview(gradient, preview, pattern)
        this.update()

        return element
    }

    addColorStop(colorStop, colorStopsContainer, gradient, preview, pattern){
        let csForm = colorStop.buildForm(colorStopsContainer)

        let buttonsContainer = App.createElement('div', {className: "form"}, csForm)
        let removeButton = App.createElement('button', {innerHTML: "Remove"}, buttonsContainer)
        removeButton.addEventListener('click', ()=>{
            gradient.colorStops.remove(colorStop)
            this.updatePreview(gradient, preview, pattern)
            this.update()
            csForm.remove()
        })
        let duplicateButton = App.createElement('button', {innerHTML: "Duplicate"}, buttonsContainer)
        duplicateButton.addEventListener('click', ()=>{
            let newCS = colorStop.clone()
            gradient.colorStops.push(newCS)
            this.addColorStop(newCS, colorStopsContainer, gradient, preview, pattern)
        })

        this.updatePreview(gradient, preview, pattern)
        this.update()

        colorStop.addEventListener('update', ()=> {
            this.updatePreview(gradient, preview, pattern)
            this.update()
        })
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

        this.codePreview.innerHTML = `<strong>background-image</strong>: ${this.gradients.map(gradient => gradient.toCss()).join(',<br>')};`
        this.codePreview.innerHTML += `<br><strong>background-size</strong>: ${gradientSize};`
        this.codePreview.innerHTML += `<br><strong>background-position</strong>: ${gradientPosition};`
        
    }

    updatePreview(gradient, preview, pattern){
        preview.style.backgroundImage = gradient.toCss()
        preview.style.backgroundPosition = gradient.toCssPosition()
        preview.style.backgroundSize = gradient.toCssSize()
        pattern.style.backgroundImage = gradient.toCss()
    }

    static createElement(tagName="div", attr={}, parent=null){
        let element = document.createElement(tagName)
        for(let key in attr) element[key] = attr[key]
        if(parent) parent.appendChild(element)
        return element
    }

    
}

export const Shapes = [
    {
        name: "Linear Gradient",
        css: `
            background-image: linear-gradient(0deg, transparent 0%, white 100%);
            background-size: 100% 100%;
            background-position: 0% 0%;
        `
    },
    {
        name: "Radial Gradient",
        css: `
            background-image: radial-gradient(circle at 50% 50%, white 0%, transparent 100%);
            background-size: 100% 100%;
            background-position: 50% 50%;
        `
    },
    {
        name: "Conic Gradient",
        css: `
            background-image: conic-gradient(from 0deg at 50% 50%, white 0deg, transparent 360deg);
            background-size: 100% 100%;
            background-position: 50% 50%;
        `
    },
    {
        name: "Grid",
        css: `
            background-image: linear-gradient(0deg, transparent 90%, #fff 90%),
            linear-gradient(-90deg, transparent 90%, #fff 90%);
            background-size: 10px 10px,10px 10px;
            background-position: 0% 0%,0% 0%;
        `
    },
    {
        name: "Square",
        css: `
            background-image: conic-gradient(from -90deg at 50% 50%, white 0deg, white 90deg, transparent 90deg);
            background-size: 10px 10px;
            background-position: 0% 0%;
        `
    },
    {
        name: "Triangle",
        css: `
            background-image: conic-gradient(from 150deg at 50% 25%, white 0deg, white 60deg, transparent 60deg);
            background-size: 10px 10px;
            background-position: 0% 0%;
        `
    },
    {
        name: "Circle",
        css: `
            background-image: radial-gradient(circle at 50% 50%, white 0%, white 50%, transparent 50%);
            background-size: 10px 10px;
            background-position: 50% 50%;
        `
    }
]