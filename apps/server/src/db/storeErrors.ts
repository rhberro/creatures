import type { StoreErrorCode } from '@creatures/contracts/store';

import type { DatabaseError } from '~/db/types';
import { readStoreErrorMessage } from '~/validation/store';

const RAISE_EXCEPTION = 'P0001';

const ITEM_UNAVAILABLE_MESSAGE = 'store_item_unavailable';
const INVALID_QUANTITY_MESSAGE = 'store_invalid_quantity';
const INSUFFICIENT_GOLD_MESSAGE = 'store_insufficient_gold';
const ITEM_NOT_IN_BACKPACK_MESSAGE = 'store_item_not_in_backpack';
const TRAINER_NOT_FOUND_MESSAGE = 'store_trainer_not_found';

export type StoreApiError = {
  code: StoreErrorCode;
  message: string;
  status: number;
};

/**
 * The store operations are transactional functions that refuse the change with
 * a raised exception, and the exception carries the reason of the refusal.
 */
export function mapStoreOperationError(error: DatabaseError): StoreApiError {
  if (error.code === RAISE_EXCEPTION) {
    if (error.message === ITEM_UNAVAILABLE_MESSAGE) {
      return buildStoreError(404, 'store_item_unavailable');
    }
    if (error.message === INVALID_QUANTITY_MESSAGE) {
      return buildStoreError(400, 'store_invalid_quantity');
    }
    if (error.message === INSUFFICIENT_GOLD_MESSAGE) {
      return buildStoreError(409, 'store_insufficient_gold');
    }
    if (error.message === ITEM_NOT_IN_BACKPACK_MESSAGE) {
      return buildStoreError(404, 'store_item_not_in_backpack');
    }
    if (error.message === TRAINER_NOT_FOUND_MESSAGE) {
      return buildStoreError(404, 'trainer_not_found');
    }
  }
  return buildStoreError(500, 'store_internal_error');
}

function buildStoreError(status: number, code: StoreErrorCode): StoreApiError {
  return { code, message: readStoreErrorMessage(code), status };
}
