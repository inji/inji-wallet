import {useCountdown} from '../useCountdown';
import type {MdocRequestReviewProps} from './types';

export function useMdocRequestReview({
  expiresAt,
}: Pick<MdocRequestReviewProps, 'expiresAt'>) {
  const countdown = useCountdown(expiresAt);
  return {
    countdown,
    isExpired: expiresAt !== undefined && countdown.remainingSeconds === 0,
  };
}
