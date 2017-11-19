import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'

declare var require: any
const faviconImg = require('./favicon.png')
const styles = require('./server.css')

const Html = (props: { path: string, assets: string[] }) => {
    const css = props.assets.filter(path => path.match(/\.css$/))
    const js = props.assets.filter(path => path.match(/client\.js$/))
    
    return <html> 
        <head>
            <title>A Mispy web project</title>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <meta name="description" content="A Mispy web project description"/>
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
            {css.map(cssPath =>
                <link rel="stylesheet" type="text/css" href={'/'+cssPath}/>  
            )}       
            <link rel="icon" href={faviconImg}/>         
        </head>
        <body>
            {js.map(path =>
                <script src={'/'+path}/>  
            )}
            <script async dangerouslySetInnerHTML={{__html: "window.main()"}}></script>
        </body>
    </html>
}

export default (locals: any, callback: (val: null, html: string) => void) => {
    const assets = Object.keys(locals.webpackStats.compilation.assets)
    callback(null, ReactDOMServer.renderToString(<Html path={locals.path} assets={assets}/>))
};