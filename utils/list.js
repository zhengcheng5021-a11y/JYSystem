function rows(result) {
  const value = result && result.result
  return Array.isArray(value) ? value : (Array.isArray(result) ? result : [])
}

function total(result) {
  return Number((result && (result.totalNum || result.total)) || 0)
}

function hasMore(page, pageSize, result) {
  const count = rows(result).length
  return count > 0 && (count >= Number(pageSize || 0) || total(result) > Number(page || 1) * Number(pageSize || 0))
}

function appendUnique(current, incoming) {
  const seen = new Set((current || []).map((item) => String(item.id)))
  return (current || []).concat((incoming || []).filter((item) => !seen.has(String(item.id))))
}

module.exports = { rows, total, hasMore, appendUnique }
