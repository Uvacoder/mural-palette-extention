import axios from "axios"
import { useState } from "react"
import ColorThief from 'color-thief-browser'

import { Button, TextAndFileInput, PaletteList, MiniPaletteList } from "./components"
import { ArrowIcon, PlusIcon } from "./icons"

import './App.css'

function App() {
  const [brandPalette, setBrandPalette] = useState([])
  const [brandUrl, setBrandUrl] = useState('https://facebook.com')
  const [file, setFile] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [loading, setLoading] = useState(false)

  const handlePaintBorder = async () => {
    const selectedWidgetsList = await window.muralSdk.selectionSdk.list()
    if (selectedWidgetsList.length) {
      selectedWidgetsList.forEach(selectedWidget => {
        window.muralSdk.widgets.set.border.style(selectedWidget.id, 'solid')
        window.muralSdk.widgets.set.border.color(selectedWidget.id, selectedColor)
      })
    }
  }
  const handlePaintBackground = async () => {
    const selectedWidgetsList = await window.muralSdk.selectionSdk.list()
    if (selectedWidgetsList.length) {
      selectedWidgetsList.forEach(selectedWidget => {
        window.muralSdk.widgets.set.background.color(selectedWidget.id, selectedColor)
      })
    }
  }
  function catchColor() {
    const colorThief = new ColorThief()
    const palette = colorThief.getPalette(this, 9)
    setBrandPalette(palette)
  }
  const handleInputChange = (e) => {
    setBrandUrl(e.currentTarget.value)
  }
  const handleSelectColor = (color) => async () => {
    setSelectedColor(color)
  }
  const handleInputKeyDown = (e) => {
    const keyCode = e.key
    if (keyCode === 'Enter') {
      fetchBrandPaletteByUrl()
    }
  }
  const getPaletteByFile = () => {
    if (!file) return

    const fileExt = file.name.split('.').reverse()[0]
    if (fileExt === 'png' || fileExt === 'jpeg' || fileExt === 'jpg') {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = function () {
        const b64image = reader.result
        const baseImage = new Image()
        baseImage.src = b64image
        baseImage.onload = catchColor
      }
    }
    if (fileExt === 'pdf') {
      var reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = function (e) {
        console.log(e.target.result)
        // var myImage = new Image() // Creates image object
        // myImage.src = e.target.result // Assigns converted image to image object
        // myImage.onload = function(ev) {
        //   var myCanvas = document.getElementById("myCanvas") // Creates a canvas object
        //   var myContext = myCanvas.getContext("2d") // Creates a contect object
        //   myCanvas.width = myImage.width // Assigns image's width to canvas
        //   myCanvas.height = myImage.height // Assigns image's height to canvas
        //   myContext.drawImage(myImage,0,0) // Draws the image on canvas
        //   let imgData = myCanvas.toDataURL("image/jpeg",0.75) // Assigns image base64 string in jpeg format to a variable
        // }
      }
    }
  }
  const test = () => {
    axios.post(
      'https://dockerhost.forge-parse-server.c66.me:40131/parse/functions/test',
      { brandUrl },
      {
        headers: {
          'X-Parse-Application-Id': '10907e4927b09f11c09f5132d1712ded',
          'X-Parse-Master-Key': '845443be6b59c7de6e47a0f01c681730',
          'Content-Type': 'application/json'
        }
      }
    ).then(res => console.log(res))
  }
  const fetchBrandPaletteByUrl = () => {
    setLoading(true)
    axios.post(
      'https://dockerhost.forge-parse-server.c66.me:40131/parse/functions/getPalette',
      { brandUrl },
      {
        headers: {
          'X-Parse-Application-Id': '10907e4927b09f11c09f5132d1712ded',
          'X-Parse-Master-Key': '845443be6b59c7de6e47a0f01c681730',
          'Content-Type': 'application/json'
        }
      }
    ).then(res => {
      console.log('res => ', res)
      // const b64screenshot = res.data?.result?.screenshot
      //
      // if (b64screenshot) {
      //   const baseImage = new Image()
      //   baseImage.src = 'data:image/png;base64,' + b64screenshot
      //   baseImage.onload = catchColor
      // }

      setLoading(false)
    })
  }
  const handleGetPaletteClick = () => {
    if (file) {
      getPaletteByFile()
    } else {
      fetchBrandPaletteByUrl()
    }
  }
  const handleSetFile = (e) => setFile(e?.target?.files[0] || null)
  const handleRemoveFile = () => setFile(null)

  const renderMain = () => {
    return (
      <>
        <div className={'app-hint'} onClick={test}>Enter the website url to get the brand palette</div>
        <TextAndFileInput
          fileInputProps={{ onChange: handleSetFile, onRemoveFile: handleRemoveFile }}
          textInputProps={{ onChange: handleInputChange, onKeyDown: handleInputKeyDown, defaultValue: brandUrl }}
          file={file}
        />
        <Button disabled={!brandUrl || loading} onClick={handleGetPaletteClick} loading={loading}>
          Get palette
        </Button>
        <PaletteList paletteList={brandPalette} handleSelect={handleSelectColor} selectedColor={selectedColor} />
      </>
    )
  }
  const renderColoringMode = () => {
    return (
      <>
        <div>
          <div className={'app-coloring-mode-back'} onClick={() => setSelectedColor(null)}>
            <ArrowIcon />
            <div>Back</div>
          </div>
          <MiniPaletteList paletteList={brandPalette} handleSelect={handleSelectColor} selectedColor={selectedColor} />
          <div className={'app-coloring-mode-type-list'}>
            <div className={'app-coloring-mode-type'}>
              <div>Fill</div>
              <div className={'app-coloring-mode-type-icon'} onClick={handlePaintBackground}>
                <PlusIcon />
              </div>
            </div>
            <div className={'app-coloring-mode-type'}>
              <div>Border</div>
              <div className={'app-coloring-mode-type-icon'} onClick={handlePaintBorder}>
                <PlusIcon />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
  return (
    <div className={'app'}>
      {selectedColor ? renderColoringMode() : renderMain()}
    </div>
  )
}

export default App
