import { AppError } from "../AppError.js";

export class GoodsIssueInsufficientStock extends AppError {

    constructor() {
        super('Stock insuficiente para realizar la salida', 'GOODS_ISSUE_INSUFFICIENT_STOCK', 500);
    }
}
