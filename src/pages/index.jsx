import Head from 'next/head'
import { Inter } from 'next/font/google'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  useEffect(() => {
	import ('../lib/main.js').then(_ => _)
  }, [])

  return (
    <>
  <Head>
    <title>physics</title>
  </Head>
    <div className="root">
		<div className='mode-container'>
    		<input type='radio' id='pull' name='mode' value='pull'/>
			<label htmlFor='pull'>PULL</label>
			<input type='radio' id='pin' name='mode' value='pin' />
			<label htmlFor='pin'>PIN</label>
			<input type='radio' id='connect' name='mode' value='connect' />
			<label htmlFor='connect'>CONNECT</label>
			<input type='radio' id='circle' name='mode' value='circle' />
			<label htmlFor='circle'>CIRCLE</label>
			<label>Navigation: <strong>WSAD or Arrow Keys</strong></label>
			<label>Zoom In = <strong>Z</strong>, Zoom Out = <strong>X</strong></label>
		</div>
		<div id='canvas-wrapper'>
			<canvas id="canvas"></canvas>
		</div>
    </div>

    </>
  )
}
