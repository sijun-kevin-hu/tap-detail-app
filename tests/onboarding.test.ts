/** @jest-environment node */
import { suggestBookingLink, isValidBookingLink } from '../src/lib/booking-link';

const mockVerify = jest.fn();
const mockGet = jest.fn();
const mockUpdate = jest.fn();
const mockSet = jest.fn();
const mockTransaction = { get: mockGet, update: mockUpdate, set: mockSet };
const mockDb = {
  collection: jest.fn((name: string) => ({
    doc: (id: string) => ({ path: `${name}/${id}` }),
    where: () => ({ legacyQuery: true }),
  })),
  runTransaction: jest.fn((callback: (transaction: typeof mockTransaction) => unknown) => callback(mockTransaction)),
};
jest.mock('../src/lib/firebase/admin', () => ({ adminApp: {}, adminAuth: { verifyIdToken: (...args: unknown[]) => mockVerify(...args) } }));
jest.mock('firebase-admin/firestore', () => ({ getFirestore: () => mockDb, FieldValue: { serverTimestamp: () => 'timestamp' } }));
jest.mock('next/server', () => ({ NextResponse: { json: (data: unknown, init?: ResponseInit) => Response.json(data, init) } }));
import { POST } from '../src/app/api/onboarding/route';
import type { NextRequest } from 'next/server';

const payload = { step: 'business', firstName: 'Kevin', lastName: 'Hu', businessName: 'Kevin’s Detailing', businessId: 'kevins-detailing' };
function request(body = payload, authorized = true) {
  return new Request('http://localhost/api/onboarding', { method: 'POST', headers: authorized ? { authorization: 'Bearer token' } : {}, body: JSON.stringify(body) }) as NextRequest;
}
beforeEach(() => {
  jest.clearAllMocks();
  mockVerify.mockResolvedValue({ uid: 'owner', email_verified: true });
  mockGet.mockReset();
  mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ onboardingCompleted: false }) })
    .mockResolvedValueOnce({ exists: false }).mockResolvedValueOnce({ docs: [] });
});
test('suggests readable links and validates boundaries', () => {
  expect(suggestBookingLink('  Café & Auto Detail  ')).toBe('cafe-auto-detail');
  expect(suggestBookingLink('a'.repeat(59) + ' -- x')).toHaveLength(59);
  expect(isValidBookingLink('kevins-detailing')).toBe(true);
  for (const invalid of ['', '-name', 'name-', 'a/b', 'A', 'a'.repeat(61)]) expect(isValidBookingLink(invalid)).toBe(false);
});
test('requires verified authentication', async () => {
  expect((await POST(request(payload, false))).status).toBe(401);
  mockVerify.mockResolvedValue({ uid: 'owner', email_verified: false });
  expect((await POST(request())).status).toBe(403);
  expect(mockDb.runTransaction).not.toHaveBeenCalled();
});
test('saves name without publishing or reserving a link', async () => {
  expect((await POST(request({ ...payload, step: 'name' }))).status).toBe(200);
  expect(mockSet).not.toHaveBeenCalled();
  expect(mockUpdate.mock.calls[0][1]).toEqual({ firstName: 'Kevin', lastName: 'Hu', updatedAt: 'timestamp' });
});
test('reserves link and completes profile in one transaction', async () => {
  expect((await POST(request())).status).toBe(200);
  expect(mockSet).toHaveBeenCalledWith({ path: 'bookingLinks/kevins-detailing' }, { uid: 'owner' });
  expect(mockUpdate.mock.calls[0][1]).toMatchObject({ businessId: 'kevins-detailing', onboardingCompleted: true, isActive: true });
});
test.each(['reservation', 'legacy'])('rejects a link owned by an existing %s business', async kind => {
  mockGet.mockReset();
  mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ onboardingCompleted: false }) })
    .mockResolvedValueOnce({ exists: kind === 'reservation', data: () => ({ uid: 'other' }) })
    .mockResolvedValueOnce({ docs: kind === 'legacy' ? [{ id: 'other' }] : [] });
  expect((await POST(request())).status).toBe(409);
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockSet).not.toHaveBeenCalled();
});
test('completion can be retried after a lost response', async () => {
  mockGet.mockReset().mockResolvedValueOnce({ exists: true, data: () => ({ onboardingCompleted: true, businessId: payload.businessId }) });
  expect((await POST(request())).status).toBe(200);
  expect(mockUpdate).not.toHaveBeenCalled();
});
test('rejects invalid names and URL paths before touching the database', async () => {
  expect((await POST(request({ ...payload, businessId: '../admin' }))).status).toBe(400);
  expect((await POST(request({ ...payload, firstName: '  ' }))).status).toBe(400);
  expect(mockDb.runTransaction).not.toHaveBeenCalled();
});
