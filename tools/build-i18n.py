import json, sys
L = ['en','id','pt','es','tr','de','fr','ja','fil','th']
out = {l: {} for l in L}; bad = []
for ln, line in enumerate(open('tools/strings.tsv', encoding='utf-8'), 1):
    if line.startswith('#') or not line.strip(): continue
    p = [x.strip() for x in line.rstrip('\n').split(' | ')]
    if len(p) != 11: bad.append((ln, len(p), p[0])); continue
    for i, l in enumerate(L): out[l][p[0]] = p[i+1]
if bad: print('BAD ROWS', bad); sys.exit(1)
for l in L: json.dump(out[l], open(f'www/i18n/{l}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print({l: len(out[l]) for l in L})
