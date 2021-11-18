import { Inject, Injectable } from '@nestjs/common';

// imports
import { DynamoModuleProviders } from '../DynamoDB/Dynamo.types';
import { DynamoService } from '../DynamoDB/Dynamo.service';

// types
import {
  HandleRoadmapSaveType,
  RoadmapTableDataType,
  RoadmapOwnerDataUpdateType,
} from '../Roadmaps/Roadmaps.types';

// errors
import { DynamoDbException } from '../CustomErrors/Dynamo.errors';

@Injectable()
export class RoadmapsService {
  private readonly tableName: string = 'roadmaps_data';

  constructor(
    @Inject(DynamoModuleProviders.DYNAMO_SERVICE)
    private readonly dynamoService: DynamoService,
  ) {}

  private async checkIfRoadmapOwnerExist(githubName: string) {
    const { response } = await this.dynamoService.get({
      tableName: this.tableName,
      primaryKey: {
        github_name: githubName,
      },
    });
    if (response) return true;
    return false;
  }

  async handleRoadmapOwnerProductUpdate({
    github_name,
    product,
  }: RoadmapOwnerDataUpdateType) {
    // update DB
  }

  async handleRoadmapSave({
    github_name,
    productData,
    couponDetails,
    userDetails,
  }: HandleRoadmapSaveType) {
    const { date_completed, name, ...restProductData } = productData;

    try {
      // TODO
      await this.dynamoService.insert<RoadmapTableDataType>({
        primaryKey: {
          github_name,
        },
        tableName: this.tableName,
        data: {
          purcharsed_products: [{ [name]: { ...restProductData } }],
          user_data: {
            ...userDetails,
          },
          used_coupons: couponDetails
            ? [
                {
                  [couponDetails.code]: couponDetails.discount,
                },
              ]
            : null,
          other_details: {
            date_of_bought: date_completed,
          },
        },
      });
    } catch (e) {
      console.log(e);
      throw new DynamoDbException();
    }
  }
}
