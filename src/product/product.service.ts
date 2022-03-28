import { Injectable } from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';
import { ProductModel } from './product.model';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductDto } from './dto/find-product.dto';
import { ReviewModel } from '../review/review.model';

@Injectable()
export class ProductService {
  constructor(@InjectModel(ProductModel) private readonly productModel: ModelType<ProductModel>) { }

  async create(dto: CreateProductDto) {
    return this.productModel.create(dto);
  }

  async findById(id: string) {
    return this.productModel.findById(id).exec();
  }

  async deleteById(id: string) {
    return this.productModel.findByIdAndDelete(id).exec();
  }

  async updateById(id: string, dto: CreateProductDto) {
    //   new:true will return updated dto , without this option not updated
    return this.productModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async findWithReviews(dto: FindProductDto) {
    return (this.productModel.aggregate([
      {
        $match: {
          categories: dto.category
        }
      },
      {
        $sort: {
          _id: 1
        }
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: 'Review',
          localField: '_id',
          foreignField: 'productId',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          reviewCount: { $size: '$reviews' },
          reviewAvg: { $avg: '$reviews.rating' },
          reviews: {
            $function: {
              body: `function(reviews) {
                reviews.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
                return reviews;
              }`,
              args: ['$reviews'],
              lang: 'js'
            }
          }
        }
      }
    ]).exec()) as Promise<(ProductModel & { review: ReviewModel[], reviewCount: number, reviewAvg: number })[]>;

  }
}
