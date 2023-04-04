# Leetcode Notes

## Arrays

### 1. Two sum (easy)
1. vector<int>作为return值时，也可以用{}返回。（可以理解为用大括号初始化）

``` c
vector<int> main()
{
    return {-1, -1};
}
```

### 26. Remove Duplicates from Sorted Array (easy)
我的做法：
``` c
class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        unordered_map<int, int> m;
        int idx {0};
        for (int i=0; i < nums.size(); i++){
            if (m[nums[i]] == 0){
                nums[idx] = nums[i];
                idx++;
                m[nums[i]]++;
            }
        }
        return idx;
    }
};
```

最优做法
``` c
class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        unordered_map<int, int> m;
        int idx {0};
        for (int i=0; i < nums.size(); i++){
            if (m[nums[i]] == 0){
                nums[idx] = nums[i];
                idx++;
                m[nums[i]]++;
            }
        }
        return idx;
    }
};
```
本质区别在于，其不需要用map，而是另用一个指针。可以这样做的原因是，这里的数字是顺序排列的，如果有重复，也只是连续的重复。但是如果是不规则排序，则必须要用map。

### 35. Search Insert Position (easy)
1. 二分法的最外层循环必须是$\le$（小于等于）。

