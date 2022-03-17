import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Object3D } from 'three/src/core/Object3D';
import { Conf } from '../core/conf';
import { Color } from "three/src/math/Color";
import { PlaneGeometry } from "three/src/geometries/PlaneGeometry";
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial";
import { Mesh } from 'three/src/objects/Mesh';
import { Util } from '../libs/util';
import { Mouse } from '../core/mouse';

export class Con extends Canvas {

  private _con: Object3D;
  private _block:Array<Mesh> = [];
  private _textList:Array<string> = [];
  private _textTemp:Array<Array<number>> = [];
  private _colTemp:Array<Color> = [];
  private _col:Color = new Color(0xffffff);
  private _line:number = 50

  constructor(opt: any) {
    super(opt);

    this._con = new Object3D()
    this.mainScene.add(this._con)

    // 表示に使うテキスト入れておく
    this._textList = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')

    const geo = new PlaneGeometry(1,1)

    const num = this._line * this._line
    for(let i = 0; i < num; i++) {
      const b = new Mesh(
        geo,
        new MeshBasicMaterial({
          color:0x000000
        })
      )
      this._con.add(b)
      this._block.push(b)
    }

    this._resize()
  }


  protected _update(): void {
    super._update()
    this._con.position.y = Func.instance.screenOffsetY() * -1

    const sw = Func.instance.sw()
    // const sh = Func.instance.sh()
    const mx = Util.instance.map(Mouse.instance.easeNormal.x, 0, 1, -1, 1)
    const my = Util.instance.map(Mouse.instance.easeNormal.y, 0, 1, -1, 1)

    const isStart = true
    let text = ''
    const hitArea:Array<number> = [] // 0が空白部分
    const textNum = 100

    // 色 一定間隔で
    if(this._c % 10 == 0) {
      this._col = new Color(Util.instance.random(0, 1), Util.instance.random(0, 1), Util.instance.random(0, 1))
      const bright = 0
      this._col.r += bright
      this._col.g += bright
      this._col.b += bright
    }

    const x = mx
    const y = my
    const range = Util.instance.map(y, 0, 0.3, 0, 1)
    for(let i = 0; i < textNum; i++) {
      const per = i / textNum
      if(isStart && Math.abs(per - x) < range) {
        hitArea[i] = 0
      } else {
        if(hitArea[i] == undefined || hitArea[i] != 0) {
          hitArea[i] = 1
        }
      }
    }

    // コンソールに出すテキスト
    // let hitNum = 0
    hitArea.forEach((val,i) => {
      if(val == 0) {
        text += ' '
      } else {
        const key = (this._c + i) % (this._textList.length - 1)
        text += this._textList[key]
      }
    })
    // let tgCol
    // if(hitNum >= 2) {
    //   tgCol = new Color(0xff0000)
    // } else {
    //   tgCol = new Color(0xffffff)
    // }
    // const ease = 0.5
    // this._col.r += (tgCol.r - this._col.r) * ease
    // this._col.g += (tgCol.g - this._col.g) * ease
    // this._col.b += (tgCol.b - this._col.b) * ease
    console.log('%c' + text, 'font-weight:bolder; color:#' + this._col.getHexString() + ';font-size:10px;background-color:#000;')

    this._textTemp.push(hitArea)
    if(this._textTemp.length >= this._line) {
      this._textTemp.shift()
    }

    this._colTemp.push(this._col.clone())
    if(this._colTemp.length >= this._line) {
      this._colTemp.shift()
    }

    const aw = sw * 0.95
    // const ah = sh * 0.95
    const sizeOffset = 0.75
    const sizeX = aw / this._line
    const sizeY = sizeX
    const len = this._block.length
    for(let i = 0; i < len; i++) {
      const b = this._block[i]
      const ix = i % this._line
      const iy = ~~(i / this._line)

      const key = (this._c + i) % (this._textList.length - 1)
      const scale = Util.instance.map(key, 0.1, 1, 0, this._textList.length - 1)

      b.scale.set(sizeX * sizeOffset * scale, sizeY * sizeOffset * scale, 1)
      b.position.x = ix * sizeX - (sizeX * this._line * 0.5)
      b.position.y = iy * -sizeY + (sizeY * this._line * 0.5)

      const useHitText = this._textTemp[iy]
      const useCol = this._colTemp[iy]
      if(useHitText != undefined) {
        const hitKey = ~~((ix / (this._line - 1)) * (useHitText.length - 1));
        let col = new Color(0x000000)
        if(useHitText[hitKey] == 1) {
          col = useCol
        }
        (b.material as MeshBasicMaterial).color = col
      }
    }


    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    const bgColor = 0x000000
    this.renderer.setClearColor(bgColor, 1)
    this.renderer.render(this.mainScene, this.camera)
  }


  public isNowRenderFrame(): boolean {
    return this.isRender
  }


  _resize(isRender: boolean = true): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    if(Conf.instance.IS_SP || Conf.instance.IS_TAB) {
      if(w == this.renderSize.width && this.renderSize.height * 2 > h) {
        return
      }
    }

    this.renderSize.width = w;
    this.renderSize.height = h;

    this.updateCamera(this.camera, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();

    if (isRender) {
      this._render();
    }
  }
}
