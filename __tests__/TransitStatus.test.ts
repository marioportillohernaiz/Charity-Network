import { TransitStatus } from '../types/TransitStatus';

describe('TransitStatus', () => {
  it('should have the correct values', () => {
    expect(TransitStatus.REQUESTED).toBe('Requested');
    expect(TransitStatus.IN_TRANSIT).toBe('In transit');
    expect(TransitStatus.RECEIVED).toBe('Received');
    expect(TransitStatus.REJECTED).toBe('Rejected');
    expect(TransitStatus.CANCELLED).toBe('Cancelled');
  });
});