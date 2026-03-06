import { getLocaleCurrencyCode } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { ProductDto } from 'src/api';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  @Input() product: ProductDto | undefined;

  currency: string = getLocaleCurrencyCode(navigator.language) ?? "PLN"
  base64Image: any;

  constructor() { }

  ngOnInit(): void {
    let imageUrl : string; 
    if(this.product?.image?.startsWith('http')){
      imageUrl = this.product?.image;
    }
    else {
      imageUrl = "/assets" + this.product?.image;
    }

    this.getBase64ImageFromURL(imageUrl).subscribe((base64data: string) => {
      console.log(base64data);
      this.base64Image = 'data:image/jpg;base64,' + base64data;
    });
  }


  getBase64ImageFromURL(url: string) {
    return Observable.create((observer: Observer<string>) => {
      let img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = url;
      if (!img.complete) {
        img.onload = () => {
          observer.next(this.getBase64Image(img));
          observer.complete();
        };
        img.onerror = (err) => {
          observer.error(err);
        };
      } else {
        observer.next(this.getBase64Image(img));
        observer.complete();
      }
    });
  }

  getBase64Image(img: HTMLImageElement) {
    // We create a HTML canvas object that will create a 2d image
    var canvas = document.createElement("canvas");
    //canvas.width = img.width;
    //canvas.height = img.height;

    //canvas.width = 100;
    //canvas.height = 100;

    /*var hRatio = canvas.width / img.width;
    var vRatio = canvas.height / img.height;
    var ratio  = Math.min ( hRatio, vRatio );*/
    console.log("Width: "+img.width);
    console.log("Height: "+img.height);
    let ratio = img.width/img.height;
    console.log("Ratio: "+ratio);
    canvas.width = 100;
    canvas.height = 100;
    let height = this.getHeight(200,ratio);
    let width = this.getWidth(100,ratio);
    canvas.width = width;
    canvas.height = width/ratio;
    var ctx = canvas.getContext("2d");
    // This will draw image    
    //ctx?.drawImage(img, 0, 0, 200, 200, 0,0,img.width*ratio, img.height*ratio);
    
    ctx?.drawImage(img, 0, 0, width, width/ratio);
    // Convert the drawn image to Data URL
    var dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
 }
 
  private getWidth(length: number, ratio: number) {
    var width = ((length)/(Math.sqrt((1)/(Math.pow(ratio, 2)+1))));
    return Math.round(width);
  }
  private getHeight(length: number, ratio: number) {
    var height = ((length)/(Math.sqrt((Math.pow(ratio, 2)+1))));
    return Math.round(height);
  }
  
}


