sed -i 's/permissionRank.read > permissionRank\[current\]/1 > 0/g' lib/kylrixflow.ts
sed -i 's/permissionRank\[collaborator.permission\] > permissionRank\[current\]/1 > 0/g' lib/kylrixflow.ts
sed -i '/const permissionRank/d' lib/kylrixflow.ts
