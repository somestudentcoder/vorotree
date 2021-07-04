// app.ts

import { Model } from './model';
import { View } from './view';
import { Controller } from './controller';
import {component} from "riot";
import App from './basicView.riot'

declare global {
   var model: Model;
   var view: View;
   var controller: Controller;
}

component(App)(document.getElementById("header") || document.body,
    { title: 'Interactive Voronoi Treemap' });

window.model = new Model();
window.view = new View();
window.controller = new Controller();