const nodes = [
	[24.899368324929043,475.46094346653126],[61.899368409284335,457.4609434718035],[116.89936841221623,455.4609434719867],[175.89936841228123,467.46094347199073],[232.8993684122837,483.46094347199073],[293.8993684122837,499.46094347199073],[373.8993684122837,510.46094347199073],[422.8993684122837,506.46094347199073],[464.8993684122837,484.46094347199073],[495.8993684122837,456.46094347199073],[521.8993684122837,424.46094347199073],[544.8993684122837,391.46094347199073],[559.8993684122837,370.46094347199073],[592.2587760459264,340.10506764536933],[621.2587760459264,321.10506764536933],[654.2587760459264,304.10506764536933],[701.2587760459264,288.10506764536933],[755.2587760459264,268.10506764536933],[807.2587760459264,246.10506764536933],[849.2587760459264,218.10506764536933],[881.2587760459264,187.10506764536933],[911.2587760459264,155.10506764536933],[947.2587760459264,113.10506764536933],[981.2587760459264,78.10506764536933],[997.1991690190139,52.54263889071889],[1025.199168919606,24.54263892799682],[1048.1991689176357,-16.457361071264415],[1080.1991689175513,-49.45736107123271],[1105.1991689175497,-100.45736107123173],[1131.1991689175497,-146.45736107123173],[1162.1991689175497,-175.45736107123173],[1195.1991689175497,-195.45736107123173],[1241.1991689175497,-207.45736107123173],[1273.1991689175497,-205.45736107123173],[1310.1991689175497,-196.45736107123173],[1333.1991689175497,-173.45736107123173],[1351.1991689175497,-140.45736107123173],[1378.1991689175497,-67.45736107123173],[1409.1991689175497,3.5426389287682696],[1439.1991689175497,53.54263892876827],[1454.1991689175497,75.54263892876827],[1466.5126916921413,109.16768337796795],[1492.5126951675197,155.1676835710445],[1523.5126952251803,198.1676835742479],[1578.5126952255414,208.16768357426795],[1623.5126952255487,229.16768357426838],[1695.5126952255487,246.16768357426838],[1739.5126952255487,257.1676835742684],[1787.5126952255487,271.1676835742684],[1855.5126952255487,284.1676835742684],[1895.0625709168512,318.9381923457827],[1937.0625717647476,365.93819412106643],[1973.0625717653897,400.93819412240964],[2012.062571765402,439.93819412244],[2053.062571765402,492.93819412244034],[2108.062571765402,558.9381941224403],[2159.062571765402,614.9381941224403],[2218.062571765402,678.9381941224403],[2283.062571765402,733.9381941224403],[2360.062571765402,768.9381941224403],[2406.1602717854485,814.4863031970475],[2441.160234957659,854.4863822684773],[2516.1602321146966,908.4863883724865],[2571.1602318125874,967.4863890211325],[2651.1602317711395,1021.4863891101236],[2714.160231766359,1071.486389120386],[2787.1602317655193,1121.4863891221903],[2861.16023176542,1157.4863891224027],[2910.1602317654065,1177.4863891224325],[2982.818092584533,1216.5246726599426],[3064.8173138029515,1244.5253123733846],[3116.8172429206084,1282.5253705981659],[3189.817230862829,1335.525380502771],[3221.817229171835,1386.5253818918013],[3263.817228799212,1445.525382197885],[3321.8172287414063,1473.5253822453678],[3380.817228734487,1476.5253822510517]
].concat(
	[[3381.0485089855056,1480.453236984793],[3420.3559769997846,1446.4603405452026],[3442.2623339248694,1479.4612084817043],[3471.2384630341517,1434.4614854137153],[3486.300523343283,1478.4614840211552],[3493.212513199619,1449.4614976786736],[3510.265153092421,1472.461510038365],[3548.251214268274,1403.4615135772387],[3559.2501905229155,1423.461513685907],[3571.2507003259316,1412.4615137142562],[3578.2506814767185,1430.461513723043],[3589.249844165564,1422.4615137256092],[3600.2505432991134,1441.4615137262067],[3619.250104291885,1433.4615137272244],[3634.250100712308,1465.4615137273236],[3647.2503016476735,1459.4615137273822],[3655.2501737810935,1479.4615137274495],[3667.250230124334,1463.461513727467],[3678.25021143118,1476.4615137274718],[3687.250208653553,1467.4615137274723],[3695.2502185551875,1478.4615137274723],[3709.2502064602563,1464.4615137274723],[3727.2502123340328,1483.4615137274723],[3737.2502116445435,1464.4615137274723],[3749.2502099343465,1477.4615137274723],[3763.2502118745588,1461.4615137274723],[3777.250210937585,1482.4615137274723],[3793.250211042539,1462.4615137274723],[3815.250211319904,1485.4615137274723],[3830.2502110139153,1471.4615137274723],[3843.250211086054,1481.4615137274723],[3852.2502111042522,1470.4615137274723],[3860.2502110775104,1483.4615137274723],[3867.2502111255853,1470.4615137274723],[3878.250211100967,1485.4615137274723],[3888.2502111100002,1473.4615137274723],[3894.250211113371,1503.4615137274723],[3912.250211109821,1517.4615137274723],[3906.250211109351,1533.4615137274723],[3923.2502111093154,1533.4615137274723],[3924.2502111094104,1550.4615137274723],[3944.250211109453,1552.4615137274723],[3946.250211109409,1575.4615137274723],[3966.250211109326,1577.4615137274723],[3967.2502111094836,1599.4615137274723],[3988.250211109315,1606.4615137274723],[3989.2502111094414,1629.4615137274723],[4016.250211109335,1645.4615137274723],[4014.25021110936,1668.4615137274723],[4033.250211109339,1673.4615137274723],[4045.250211109413,1689.4615137274723],[4063.1666636005057,1704.1020147962636],[4065.171322997523,1725.1020149219141],[4132.170175432429,1771.102014940805],[4167.170176383484,1769.1020149408084],[4185.1701628612645,1803.1020149408087],[4226.170180631512,1805.102014940809],[4238.17017348648,1839.102014940809],[4305.170169321702,1856.102014940809],[4337.170176260685,1894.102014940809],[4381.170172897252,1896.102014940809],[4425.1701713074435,1886.102014940809],[4483.170174098835,1884.102014940809],[4527.170172647538,1883.102014940809],[4594.170173476814,1877.102014940809],[4618.170173015748,1859.102014940809],[4650.17017307761,1841.102014940809],[4669.170173181643,1817.102014940809],[4691.170173010232,1774.102014940809],[4730.170173093095,1736.102014940809]]
)

export default nodes;
