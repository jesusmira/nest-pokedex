import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { PokeResponse } from './interfaces/poke-response.interface';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';


@Injectable()
export class SeedService {

 

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter
  ) {}

  async executeSeed(){

    // borramos la tabla para que no se dupliquen los registros y no nos de error
    await this.pokemonModel.deleteMany({});

    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    // Una forma de hacerlo es crear un arreglo de promesas y ejecutarlas uno por uno
    // const insertPromisesArray = [];

    // data.results.forEach(({ name, url }) => {
    //   const segment = url.split('/');
    //   const no = +segment[segment.length - 2];

    //    const pokemon = await this.pokemonModel.create({ name, no });
    //   insertPromisesArray.push(
    //     this.pokemonModel.create({ name, no })
    //   )

    // });

    // insertamos todos de vez en vez de uno por uno
    // await Promise.all( insertPromisesArray);

    // Otra forma de insercion mas rapida es creando un arreglo de objetos y insertamos una sola vez muchos

    const pokemonToInsert: { name: string, no: number }[] = [];
    data.results.forEach(({ name, url }) => {
      const segment = url.split('/');
      const no = +segment[segment.length - 2];

       pokemonToInsert.push({ name, no });
    });

    await this.pokemonModel.insertMany(pokemonToInsert);    

    return 'Seed Executed';
  }
}
