import { BigInt, TypedMap } from "@graphprotocol/graph-ts"
import {
  ChainlinkPrice,
  UniswapPrice
} from "../generated/schema"

export let BASIS_POINTS_DIVISOR = BigInt.fromI32(10000)
export let PRECISION = BigInt.fromI32(10).pow(30)

export let WETH = "0x39b1fc930c43606af5c353e90a55db10bcaf4087"
export let TARA = "0x5d0fa4c5668e5809c83c95a7cef3a9dd7c68d4fe"
export let USDT = "0x69d411cbf6dbad54bfe36f81d0a39922625bc78c"
export let USDM = "0xc26b690773828999c2612549cc815d1f252ea15e"
export let BTC = "0x0000000000000000000000000000000000000000"
export let LINK = "0x0000000000000000000000000000000000000000"
export let MIM = "0x0000000000000000000000000000000000000000"
export let SPELL = "0x0000000000000000000000000000000000000000"
export let SUSHI = "0x0000000000000000000000000000000000000000"
export let FRAX = "0x0000000000000000000000000000000000000000"
export let DAI = "0x0000000000000000000000000000000000000000"
export let GMX = "0x0000000000000000000000000000000000000000"

export function timestampToDay(timestamp: BigInt): BigInt {
  return timestamp / BigInt.fromI32(86400) * BigInt.fromI32(86400)
}

export function timestampToPeriod(timestamp: BigInt, period: string): BigInt {
  let periodTime: BigInt

  if (period == "daily") {
    periodTime = BigInt.fromI32(86400)
  } else if (period == "hourly") {
    periodTime = BigInt.fromI32(3600)
  } else if (period == "weekly") {
    periodTime = BigInt.fromI32(86400 * 7)
  } else {
    throw new Error("Unsupported period " + period)
  }

  return timestamp / periodTime * periodTime
}


export function getTokenDecimals(token: String): u8 {
  let tokenDecimals = new Map<String, i32>()
  tokenDecimals.set(WETH, 18)
  tokenDecimals.set(BTC, 8) // TJ
  tokenDecimals.set(LINK, 18)
  tokenDecimals.set(TARA, 18)
  tokenDecimals.set(USDM, 18)
  tokenDecimals.set(USDT, 6)
  tokenDecimals.set(MIM, 18)
  tokenDecimals.set(SPELL, 18)
  tokenDecimals.set(SUSHI, 18)
  tokenDecimals.set(FRAX, 18)
  tokenDecimals.set(DAI, 18)
  tokenDecimals.set(GMX, 18)

  return 18 as u8
}

export function getTokenAmountUsd(token: String, amount: BigInt): BigInt {
  let decimals = getTokenDecimals(token)
  let denominator = BigInt.fromI32(10).pow(decimals)
  let price = getTokenPrice(token)
  return amount * price / denominator
}

export function getTokenPrice(token: String): BigInt {
  if (token != GMX) {
    let chainlinkPriceEntity = ChainlinkPrice.load(token)
    if (chainlinkPriceEntity != null) {
      // all chainlink prices have 8 decimals
      // adjusting them to fit GMX 30 decimals USD values
      return chainlinkPriceEntity.value * BigInt.fromI32(10).pow(22)
    }

    if (chainlinkPriceEntity == null) {
      // all chainlink prices have 8 decimals
      // adjusting them to fit GMX 30 decimals USD values
      return BigInt.fromI32(2000) * BigInt.fromI32(10).pow(22)
    }
  }

  if (token == GMX) {
    let uniswapPriceEntity = UniswapPrice.load(GMX)

    if (uniswapPriceEntity != null) {
      return uniswapPriceEntity.value
    }
  }

  let prices = new TypedMap<String, BigInt>()
  prices.set(WETH, BigInt.fromI32(3350) * PRECISION)
  prices.set(BTC, BigInt.fromI32(45000) * PRECISION)
  prices.set(LINK, BigInt.fromI32(25) * PRECISION)
  prices.set(TARA, BigInt.fromI32(23) * PRECISION)
  prices.set(USDM, PRECISION)
  prices.set(USDT, PRECISION)
  prices.set(MIM, PRECISION)
  prices.set(SPELL, PRECISION / BigInt.fromI32(50)) // ~2 cents
  prices.set(SUSHI, BigInt.fromI32(10) * PRECISION)
  prices.set(FRAX, PRECISION)
  prices.set(DAI, PRECISION)
  prices.set(GMX, BigInt.fromI32(30) * PRECISION)

  return prices.get(token) as BigInt
}
