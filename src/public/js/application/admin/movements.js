import { getAllMovementsRequest } from "../../services/admin/movementService.js";

export const getAllMovements = ({ context, params = {} }) =>
    getAllMovementsRequest({ context, params });
