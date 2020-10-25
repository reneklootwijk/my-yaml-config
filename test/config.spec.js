/* eslint-disable mocha/no-hooks-for-single-case */

const assert = require('chai').assert
const rewireMock = require('rewiremock/node')

rewireMock.enable()

rewireMock('fs').by('./mocks/fs')

const Config = require('../lib')

describe('Configuration file tests', function () {
  var config
  var data

  before(function () {
    config = new Config([
      'file1',
      'file2',
      'file3'
    ])
  })

  it('load configuration files', async function () {
    data = await config.load()

    assert.isObject(data, 'data is no object')
  })

  it('check resulting config', function () {
    assert.strictEqual(data.file1Param, 'success', 'parameter file1Param is not correct')
    assert.strictEqual(data.file2Param, 'success', 'parameter file2Param is not correct')
    assert.strictEqual(data.file3Param, 'success', 'parameter file3Param is not correct')
    assert.strictEqual(data.param.value, 5, 'parameter param.value is not correct')
    assert.strictEqual(data.param.file1Param, 1, 'parameter param.file1Param is not correct')
    assert.strictEqual(data.param.file2Param, 2, 'parameter param.file2Param is not correct')
    assert.strictEqual(data.param.file3Param, 3, 'parameter param.file2Param is not correct')
    assert.strictEqual(data.nested.level1, 1, 'parameter nested.level1 is not correct')
    assert.strictEqual(data.nested.level.level2, 2, 'parameter nested.level.level2 is not correct')
  })

  it('get specific parameters', function () {
    assert.strictEqual(config.get('file1Param'), 'success', 'file1Param is not correct')
    assert.strictEqual(config.get('param.value'), 5, 'param.value is not correct')
    assert.strictEqual(config.get('nested.level.level2'), 2, 'nested.level.level2 is not correct')
  })

  it('get specific parameters with custom separator', function () {
    assert.strictEqual(config.get('file1Param', '/'), 'success', 'file1Param is not correct')
    assert.strictEqual(config.get('param/value', '/'), 5, 'param.value is not correct')
    assert.strictEqual(config.get('nested/level/level2', '/'), 2, 'nested.level.level2 is not correct')
  })

  it('set parameters', function () {
    config.set('param.newValue', 6)
    config.set('newTop', 4)

    assert.strictEqual(config._data.param.newValue, 6, '_data.param.newValue is not correct')
    assert.strictEqual(config._toBePersisted.param.newValue, 6, '_toBePersisted.param.newValue is not correct')
    assert.strictEqual(config._data.newTop, 4, '_data.newTop is not correct')
    assert.strictEqual(config._toBePersisted.newTop, 4, '_toBePersisted.newTop is not correct')
  })

  it('delete parameters', function () {
    config.delete('param.newValue')
    config.delete('newTop')

    assert.strictEqual(config._data.param.newValue, undefined, 'data.param.newValue is not correct')
    assert.strictEqual(config._toBePersisted.param.newValue, undefined, '_toBePersisted.param.newValue is not correct')
    assert.strictEqual(config._data.newTop, undefined, 'data.newTop is not correct')
    assert.strictEqual(config._toBePersisted.newTop, undefined, '_toBePersisted.newTop is not correct')
  })
})
