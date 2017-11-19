//import 'babel-polyfill'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as ReactDOMServer from 'react-dom/server'
import {Helmet, HelmetData} from 'react-helmet'
import {observable, computed, action} from 'mobx'
import {observer} from 'mobx-react'

import * as d3 from 'd3'
import * as d3_chromatic from 'd3-scale-chromatic'

declare var require: any
const faviconImg = require('./favicon.png')
const styles = require('./server.css')

class Body extends React.Component<{path: string, assets: string[]}> {
    content() {
        const {path} = this.props

        if (path == "/") {
            return <Homepage/>
        }           
    }

    render() {
        const {assets} = this.props
        const js = assets.filter(value => value.match(/client\.js$/))

        return <body>
            <Helmet title="Jaiden Mispy"/>
            {js.map(path =>
                <script src={'/'+path}/>  
            )}
            {this.content()}
        </body>
    }
}

class Head extends React.Component<{path: string, assets: string[], head: HelmetData}> {
    render() {
        const {head, assets, path} = this.props
        const css = assets.filter(value => value.match(/\.css$/))

        const description = `Since 2016 I have been working with Max Roser and the Oxford Martin School on Our World In Data. This project aims to make verifiable quantitative information about issues of global importance accessible and freely available to all of humanity.`

        return <head>
            {head.title.toComponent()}
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <meta name="description" content={description}/>
            {/*<meta name="twitter:title" content={head.title.toString()}/>
            <meta name="twitter:url" content={"https://mispy.me" + path}/>
            <meta name="twitter:description" content={description}/>
            <meta name="twitter:image" content={"https://mispy.me/" + sunflowerImg}/>
            <meta name="twitter:card" content="summary_large_image"/>*/}

            {/*<meta property="og:locale" content="en_US"/>
            <meta property="og:site_name" content="Jaiden Mispy"/>
            <meta property="og:title" content="Jaiden Mispy"/>
            <meta property="og:url" content={"https://mispy.me" + path}/>
            <meta property="og:description" content={description}/>
            <meta property="og:image" content={"https://mispy.me/" + sunflowerImg}/>*/}
            {head.meta.toComponent()}
            {css.map(cssPath =>
                <link rel="stylesheet" type="text/css" href={'/'+cssPath}/>  
            )}       
            <link rel="icon" href={faviconImg}/>         
            {head.link.toComponent()}
        </head>
    }
}

export default (locals: any, callback: (val: null, html: string) => void) => {
    const assets = Object.keys(locals.webpackStats.compilation.assets)
    const bodyStr = ReactDOMServer.renderToString(<Body path={locals.path} assets={assets}/>)
    const head = Helmet.renderStatic()
    const headStr = ReactDOMServer.renderToString(<Head path={locals.path} head={head} assets={assets}/>)

    callback(null, "<html>"+headStr+bodyStr+"</html>")
};


declare global {
  interface Window {
    homepageStart: Function
  }
}

window.homepageStart = function() {
    const el = ReactDOM.render(<Forest width={window.innerWidth} height={window.innerHeight}/>, document.body)

    window.onresize = function() {
        ReactDOM.render(<Forest width={window.innerWidth} height={window.innerHeight}/>, document.body)
    }
}

class Grid {
    @observable width: number
    @observable height: number

    @computed get centerX() { return Math.floor(this.width/2) }
    @computed get centerY() { return Math.floor(this.height/2) }

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
    }

    distFromCenter(i: number, j: number) {
        return Math.sqrt((i-this.centerX)**2 + (j-this.centerY)**2)
    }

    map<T>(callback: (x: number, y: number) => T) {
        const results = []
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                results.push(callback(i, j))
            }
        }
        return results
    }
}

@observer
class Forest extends React.Component<{ width: number, height: number }> {
    @computed get width() { return this.props.width }
    @computed get height() { return this.props.height }

    @computed get grid() {
        const size = 51
        return new Grid(size, 2*Math.floor(size * (this.height/this.width) / 2)+1)  
    }

    @observable offset = 0.1

    @action.bound frame() {
        this.offset += 0.004
        this.draw()
        requestAnimationFrame(this.frame)        
    }

    base: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    componentDidMount() {
        this.ctx = this.base.getContext('2d') as CanvasRenderingContext2D
        requestAnimationFrame(this.frame)
    }

    draw() {
        const {grid, offset, ctx} = this
        const tileWidth = this.props.width/grid.width
        const tileHeight = this.props.height/grid.height
        const schemes = ["Spectral"]//["Greens", "Greys", "Oranges", "Purples", "Reds", "BuGn", "BuPu", "GnBu", "OrRd", "PuBuGn", "PuBu", "PuRd", "RdPu", "YlGnBu", "YlGn", "YlOrBr", "YlOrRd"]
        const scales = schemes.map(k => (d3_chromatic as any)["interpolate"+k])//Object.keys(d3_chromatic).filter(k => k.startsWith("interpolate")).map(k => d3_chromatic[k])

        grid.map((i, j) => {
            const distFromCenter = grid.distFromCenter(i, j)
            
            let v = (1-distFromCenter/grid.distFromCenter(0, 0) + this.offset)
            const index = Math.floor(v/2 % scales.length)
            v = v % 2 < 1 ? v%1 : 1 - v%1

            const color = scales[index](v)

            ctx.fillStyle = color
            ctx.fillRect(tileWidth*i, tileHeight*j, tileWidth, tileHeight)
        })        
    }

    render() {
        return <canvas width={this.props.width} height={this.props.height}/>
    }

}

@observer
class Homepage extends React.Component {
	render() {
        return <script async dangerouslySetInnerHTML={{__html: "window.homepageStart()"}}></script>
	}
}
