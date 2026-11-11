import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Post } from '../../interfaces/post.interface';

@Component({
  selector: 'app-post-form',
  imports: [ReactiveFormsModule, NgbDatepickerModule],
  templateUrl: './post-form.html',
  styleUrl: './post-form.css',
})
export class PostForm {
  // Opciones del select de categoría
  categorias: string[] = ['Tecnología', 'Diseño', 'Programación', 'Novedades'];

  // Un FormControl independiente para cada campo (sin FormGroup)
  title = new FormControl('', [Validators.required, Validators.minLength(3)]);
  description = new FormControl('', [Validators.required, Validators.maxLength(500)]);
  category = new FormControl('', Validators.required);
  tags = new FormControl('');
  email = new FormControl('', [Validators.required, Validators.email]);
  publishNow = new FormControl(true);
  publishDate = new FormControl<NgbDateStruct | null>(null);

  // Lista donde guardo los posts creados
  posts: Post[] = [];
  enviado = false;

  constructor() {
    // Si marco "Programar fecha" la fecha pasa a ser obligatoria
    this.publishDate.disable();
    this.publishNow.valueChanges.subscribe((valor) => {
      if (valor) {
        this.publishDate.reset();
        this.publishDate.clearValidators();
        this.publishDate.disable();
      } else {
        this.publishDate.setValidators(Validators.required);
        this.publishDate.enable();
      }
      this.publishDate.updateValueAndValidity();
    });
  }

  // Fecha mínima del datepicker = hoy
  hoy(): NgbDateStruct {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }

  esValido(): boolean {
    return (
      this.title.valid &&
      this.description.valid &&
      this.category.valid &&
      this.email.valid &&
      (this.publishNow.value || this.publishDate.valid)
    );
  }

  // Muestra el error solo si el campo se ha tocado o se ha intentado enviar
  mostrarError(control: FormControl): boolean {
    return control.invalid && (control.touched || this.enviado);
  }

  guardar() {
    this.enviado = true;
    if (!this.esValido()) {
      return;
    }

    let fecha: string | null = null;
    const f = this.publishDate.value;
    if (!this.publishNow.value && f) {
      fecha = `${f.year}-${String(f.month).padStart(2, '0')}-${String(f.day).padStart(2, '0')}`;
    }

    // Paso las etiquetas de "a, b, c" a un array sin espacios ni vacíos
    const listaTags = (this.tags.value ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '');

    const post: Post = {
      id: this.posts.length + 1,
      title: this.title.value!,
      description: this.description.value!,
      category: this.category.value!,
      tags: listaTags,
      email: this.email.value!,
      publishNow: this.publishNow.value!,
      publishDate: fecha,
    };

    this.posts.push(post);
    console.log('Post guardado:', post);
    this.limpiar();
  }

  limpiar() {
    this.title.reset('');
    this.description.reset('');
    this.category.reset('');
    this.tags.reset('');
    this.email.reset('');
    this.publishNow.setValue(true);
    this.enviado = false;
  }
}
