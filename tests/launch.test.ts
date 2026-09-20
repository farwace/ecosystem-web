import assert from 'node:assert/strict';
import {test} from 'node:test';
import {detectLaunchContext as detector} from '../src/platform/detect-launch.ts';

test('direct and invitation links use web authentication', () => {
    assert.equal(detector(''), 'web');
    assert.equal(detector('?room_id=abc'), 'web');
    assert.equal(detector('?auth=reset'), 'web');
});
test('VK launches, including malformed ones, stay in VK mode', () => {
    assert.equal(detector('?vk_app_id=123&sign=abc'), 'vk');
    assert.equal(detector('?vk_user_id=123'), 'vk');
    assert.equal(detector('?sign=bad'), 'vk');
});
test('stub mode is explicitly development-only', () => {
    assert.equal(detector('?launch=vk-stub', true), 'vk');
    assert.equal(detector('?launch=vk-stub', false), 'web');
});
