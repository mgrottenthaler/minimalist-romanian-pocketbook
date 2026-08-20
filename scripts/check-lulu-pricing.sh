#!/usr/bin/env bash
# Checks current pricing/eligibility for this book's Lulu package without an
# account: Lulu's product catalogue is a public GraphQL endpoint. Greps out
# this spec's rows (trim 0425X0687, coil binding, both ink colours).
#
# Prices aren't in this endpoint — the project wizard at lulu.com is the
# authoritative number (it has disagreed with lulu.com/pricing by tens of
# cents on an identical spec). This is for distributionEligible and package
# availability, not price.
set -euo pipefail

curl -sG https://api.lulu.com/graphql/ \
  --data-urlencode 'operationName=podPackages' \
  --data-urlencode 'variables={"printableType":"BOOK"}' \
  --data-urlencode 'query=query podPackages($printableType: PrintableTypeEnum) {
    podPackages(printableType: $printableType) {
      id distributionEligible minPages maxPages interiorInkColor printQuality
      trimSize { key } bindingType { key } } }' |
  python3 -m json.tool | grep -A2 '"0425X0687\.[A-Z]*\.[A-Z]*\.CO\.'
