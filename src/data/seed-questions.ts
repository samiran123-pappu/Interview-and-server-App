// ── 150 Coding Interview Questions ────────────────────────────────────
// Seeded into Convex DB. Starter code auto-generated for 6 languages.

// ── Type System & Code Generator ─────────────────────────────────────

type SimpleType = "int" | "int[]" | "int[][]" | "string" | "string[]" | "bool" | "char[]" | "float" | "void";
type Param = [string, SimpleType];

const TM: Record<SimpleType, { ts: string; py: string; java: string; cpp: string; go: string }> = {
  int:     { ts: "number",     py: "int",             java: "int",      cpp: "int",                  go: "int" },
  "int[]": { ts: "number[]",   py: "List[int]",       java: "int[]",    cpp: "vector<int>",          go: "[]int" },
  "int[][]":{ ts: "number[][]", py: "List[List[int]]", java: "int[][]",  cpp: "vector<vector<int>>",  go: "[][]int" },
  string:  { ts: "string",     py: "str",             java: "String",   cpp: "string",               go: "string" },
  "string[]":{ ts: "string[]", py: "List[str]",       java: "String[]", cpp: "vector<string>",       go: "[]string" },
  bool:    { ts: "boolean",    py: "bool",            java: "boolean",  cpp: "bool",                 go: "bool" },
  "char[]":{ ts: "string[]",   py: "List[str]",       java: "char[]",   cpp: "vector<char>",         go: "[]byte" },
  float:   { ts: "number",     py: "float",           java: "double",   cpp: "double",               go: "float64" },
  void:    { ts: "void",       py: "None",            java: "void",     cpp: "void",                 go: "" },
};

const DR: Record<SimpleType, { java: string; cpp: string; go: string }> = {
  int:     { java: "0",              cpp: "0",    go: "0" },
  "int[]": { java: "new int[0]",     cpp: "{}",   go: "nil" },
  "int[][]":{ java: "new int[0][0]", cpp: "{}",   go: "nil" },
  string:  { java: "\"\"",           cpp: "\"\"", go: "\"\"" },
  "string[]":{ java: "new String[0]",cpp: "{}",   go: "nil" },
  bool:    { java: "false",          cpp: "false", go: "false" },
  "char[]":{ java: "new char[0]",    cpp: "{}",   go: "nil" },
  float:   { java: "0.0",            cpp: "0.0",  go: "0.0" },
  void:    { java: "",               cpp: "",     go: "" },
};

function toSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c, i) => (i > 0 ? "_" : "") + c.toLowerCase());
}

function genCode(fnName: string, params: Param[], ret: SimpleType) {
  const jsP = params.map(p => p[0]).join(", ");
  const javascript = `function ${fnName}(${jsP}) {\n  // Write your solution here\n  \n}`;

  const tsP = params.map(p => `${p[0]}: ${TM[p[1]].ts}`).join(", ");
  const tsR = ret !== "void" ? `: ${TM[ret].ts}` : ": void";
  const typescript = `function ${fnName}(${tsP})${tsR} {\n  // Write your solution here\n  \n}`;

  const pyP = params.map(p => `${p[0]}: ${TM[p[1]].py}`).join(", ");
  const pyR = ` -> ${TM[ret].py}`;
  const python = `def ${toSnake(fnName)}(${pyP})${pyR}:\n    # Write your solution here\n    pass`;

  const javaP = params.map(p => `${TM[p[1]].java} ${p[0]}`).join(", ");
  const javaRet = TM[ret].java;
  const javaBody = ret !== "void" ? `\n        return ${DR[ret].java};` : "";
  const java = `class Solution {\n    public ${javaRet} ${fnName}(${javaP}) {\n        // Write your solution here${javaBody}\n    }\n}`;

  const allTypes = [...params.map(p => p[1]), ret];
  const incl: string[] = [];
  if (allTypes.some(t => t.includes("[]"))) incl.push("#include <vector>");
  if (allTypes.some(t => t === "string" || t === "string[]")) incl.push("#include <string>");
  const cppH = incl.length > 0 ? incl.join("\n") + "\nusing namespace std;\n\n" : "";
  const cppP = params.map(p => `${TM[p[1]].cpp} ${p[0]}`).join(", ");
  const cppBody = ret !== "void" ? `\n        return ${DR[ret].cpp};` : "";
  const cpp = `${cppH}class Solution {\npublic:\n    ${TM[ret].cpp} ${fnName}(${cppP}) {\n        // Write your solution here${cppBody}\n    }\n};`;

  const goP = params.map(p => `${p[0]} ${TM[p[1]].go}`).join(", ");
  const goR = ret !== "void" ? ` ${TM[ret].go}` : "";
  const goBody = ret !== "void" ? `\n    return ${DR[ret].go}` : "";
  const go = `package main\n\nfunc ${fnName}(${goP})${goR} {\n    // Write your solution here${goBody}\n}`;

  return { javascript, typescript, python, java, cpp, go };
}

// ── Helpers ──────────────────────────────────────────────────────────

interface Example { input: string; output: string; explanation?: string; }

type SeedQuestion = {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  examples: Example[];
  constraints?: string[];
  hints?: string[];
  starterCode: { javascript: string; python: string; java: string; cpp: string; typescript: string; go: string };
};

function q(
  title: string, desc: string,
  diff: "easy" | "medium" | "hard", cat: string,
  examples: Example[],
  fn: string, params: Param[], ret: SimpleType,
  constraints?: string[], hints?: string[]
): SeedQuestion {
  return {
    title, description: desc, difficulty: diff, category: cat, examples,
    ...(constraints ? { constraints } : {}),
    ...(hints ? { hints } : {}),
    starterCode: genCode(fn, params, ret),
  };
}

const e = (input: string, output: string, explanation?: string): Example =>
  ({ input, output, ...(explanation ? { explanation } : {}) });

// ═══════════════════════════════════════════════════════════════════════
// ALL 150 QUESTIONS
// ═══════════════════════════════════════════════════════════════════════

export const SEED_QUESTIONS: SeedQuestion[] = [

  // ── ARRAYS (20) ────────────────────────────────────────────────────

  q("Two Sum", "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution, and you may not use the same element twice.", "easy", "Arrays",
    [e("nums = [2,7,11,15], target = 9", "[0,1]", "nums[0] + nums[1] == 9"), e("nums = [3,2,4], target = 6", "[1,2]")],
    "twoSum", [["nums", "int[]"], ["target", "int"]], "int[]",
    ["2 ≤ nums.length ≤ 10^4", "-10^9 ≤ nums[i] ≤ 10^9"], ["Use a hash map to store complements."]),

  q("Best Time to Buy and Sell Stock", "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve. If you cannot achieve any profit, return 0.", "easy", "Arrays",
    [e("prices = [7,1,5,3,6,4]", "5", "Buy on day 2 (price=1), sell on day 5 (price=6), profit=5"), e("prices = [7,6,4,3,1]", "0")],
    "maxProfit", [["prices", "int[]"]], "int",
    ["1 ≤ prices.length ≤ 10^5", "0 ≤ prices[i] ≤ 10^4"], ["Track the minimum price seen so far."]),

  q("Contains Duplicate", "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.", "easy", "Arrays",
    [e("nums = [1,2,3,1]", "true"), e("nums = [1,2,3,4]", "false")],
    "containsDuplicate", [["nums", "int[]"]], "bool",
    ["1 ≤ nums.length ≤ 10^5", "-10^9 ≤ nums[i] ≤ 10^9"], ["Use a Set to track seen values."]),

  q("Product of Array Except Self", "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. You must write an algorithm that runs in O(n) time and without using the division operation.", "medium", "Arrays",
    [e("nums = [1,2,3,4]", "[24,12,8,6]"), e("nums = [-1,1,0,-3,3]", "[0,0,9,0,0]")],
    "productExceptSelf", [["nums", "int[]"]], "int[]",
    ["2 ≤ nums.length ≤ 10^5", "-30 ≤ nums[i] ≤ 30"], ["Use prefix and suffix products."]),

  q("Maximum Subarray", "Given an integer array nums, find the subarray with the largest sum, and return its sum.", "medium", "Arrays",
    [e("nums = [-2,1,-3,4,-1,2,1,-5,4]", "6", "The subarray [4,-1,2,1] has the largest sum 6"), e("nums = [1]", "1")],
    "maxSubArray", [["nums", "int[]"]], "int",
    ["1 ≤ nums.length ≤ 10^5", "-10^4 ≤ nums[i] ≤ 10^4"], ["Kadane's algorithm."]),

  q("Merge Sorted Array", "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order. Merge nums2 into nums1 as one sorted array. The final sorted array should be stored inside nums1.", "easy", "Arrays",
    [e("nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3", "[1,2,2,3,5,6]"), e("nums1 = [1], m = 1, nums2 = [], n = 0", "[1]")],
    "merge", [["nums1", "int[]"], ["nums2", "int[]"]], "void",
    ["nums1.length == m + n", "0 ≤ m, n ≤ 200"], ["Start merging from the end."]),

  q("Move Zeroes", "Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements. You must do this in-place.", "easy", "Arrays",
    [e("nums = [0,1,0,3,12]", "[1,3,12,0,0]"), e("nums = [0]", "[0]")],
    "moveZeroes", [["nums", "int[]"]], "void",
    ["1 ≤ nums.length ≤ 10^4", "-2^31 ≤ nums[i] ≤ 2^31 - 1"], ["Use two pointers."]),

  q("Rotate Array", "Given an integer array nums, rotate the array to the right by k steps.", "medium", "Arrays",
    [e("nums = [1,2,3,4,5,6,7], k = 3", "[5,6,7,1,2,3,4]"), e("nums = [-1,-100,3,99], k = 2", "[3,99,-1,-100]")],
    "rotate", [["nums", "int[]"], ["k", "int"]], "void",
    ["1 ≤ nums.length ≤ 10^5", "-2^31 ≤ nums[i] ≤ 2^31 - 1"], ["Reverse the whole array, then reverse first k and last n-k."]),

  q("Single Number", "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one. You must implement a solution with linear runtime and use only constant extra space.", "easy", "Arrays",
    [e("nums = [2,2,1]", "1"), e("nums = [4,1,2,1,2]", "4")],
    "singleNumber", [["nums", "int[]"]], "int",
    ["1 ≤ nums.length ≤ 3 × 10^4"], ["XOR all numbers together."]),

  q("Majority Element", "Given an array nums of size n, return the majority element. The majority element is the element that appears more than n/2 times.", "easy", "Arrays",
    [e("nums = [3,2,3]", "3"), e("nums = [2,2,1,1,1,2,2]", "2")],
    "majorityElement", [["nums", "int[]"]], "int",
    ["n == nums.length", "1 ≤ n ≤ 5 × 10^4"], ["Boyer-Moore voting algorithm."]),

  q("Remove Duplicates from Sorted Array", "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. Return the number of unique elements.", "easy", "Arrays",
    [e("nums = [1,1,2]", "2", "nums becomes [1,2,_]"), e("nums = [0,0,1,1,1,2,2,3,3,4]", "5")],
    "removeDuplicates", [["nums", "int[]"]], "int",
    ["1 ≤ nums.length ≤ 3 × 10^4", "-100 ≤ nums[i] ≤ 100"], ["Use a slow and fast pointer."]),

  q("Plus One", "You are given a large integer represented as an integer array digits, where each digits[i] is the ith digit. Increment the large integer by one and return the resulting array of digits.", "easy", "Arrays",
    [e("digits = [1,2,3]", "[1,2,4]"), e("digits = [9,9,9]", "[1,0,0,0]")],
    "plusOne", [["digits", "int[]"]], "int[]",
    ["1 ≤ digits.length ≤ 100", "0 ≤ digits[i] ≤ 9"], ["Handle carry from the last digit."]),

  q("Intersection of Two Arrays II", "Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must appear as many times as it shows in both arrays.", "easy", "Arrays",
    [e("nums1 = [1,2,2,1], nums2 = [2,2]", "[2,2]"), e("nums1 = [4,9,5], nums2 = [9,4,9,8,4]", "[4,9]")],
    "intersect", [["nums1", "int[]"], ["nums2", "int[]"]], "int[]",
    ["1 ≤ nums1.length, nums2.length ≤ 1000"], ["Use a hash map to count occurrences."]),

  q("Find All Numbers Disappeared in an Array", "Given an array nums of n integers where nums[i] is in the range [1, n], return an array of all the integers in [1, n] that do not appear in nums.", "easy", "Arrays",
    [e("nums = [4,3,2,7,8,2,3,1]", "[5,6]"), e("nums = [1,1]", "[2]")],
    "findDisappearedNumbers", [["nums", "int[]"]], "int[]",
    ["n == nums.length", "1 ≤ nums[i] ≤ n"], ["Mark visited indices as negative."]),

  q("Third Maximum Number", "Given an integer array nums, return the third distinct maximum number. If it does not exist, return the maximum number.", "easy", "Arrays",
    [e("nums = [3,2,1]", "1"), e("nums = [1,2]", "2"), e("nums = [2,2,3,1]", "1")],
    "thirdMax", [["nums", "int[]"]], "int",
    ["1 ≤ nums.length ≤ 10^4"], ["Track top 3 distinct values."]),

  q("Subarray Sum Equals K", "Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.", "medium", "Arrays",
    [e("nums = [1,1,1], k = 2", "2"), e("nums = [1,2,3], k = 3", "2")],
    "subarraySum", [["nums", "int[]"], ["k", "int"]], "int",
    ["1 ≤ nums.length ≤ 2 × 10^4"], ["Use prefix sum with a hash map."]),

  q("Set Matrix Zeroes", "Given an m x n integer matrix, if an element is 0, set its entire row and column to 0. You must do it in place.", "medium", "Arrays",
    [e("matrix = [[1,1,1],[1,0,1],[1,1,1]]", "[[1,0,1],[0,0,0],[1,0,1]]"), e("matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]", "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]")],
    "setZeroes", [["matrix", "int[][]"]], "void",
    ["1 ≤ m, n ≤ 200"], ["Use first row and column as markers."]),

  q("Spiral Matrix", "Given an m x n matrix, return all elements of the matrix in spiral order.", "medium", "Arrays",
    [e("matrix = [[1,2,3],[4,5,6],[7,8,9]]", "[1,2,3,6,9,8,7,4,5]"), e("matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]", "[1,2,3,4,8,12,11,10,9,5,6,7]")],
    "spiralOrder", [["matrix", "int[][]"]], "int[]",
    ["1 ≤ m, n ≤ 10"], ["Use four boundaries: top, bottom, left, right."]),

  q("Pascal's Triangle", "Given an integer numRows, return the first numRows of Pascal's triangle.", "easy", "Arrays",
    [e("numRows = 5", "[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]"), e("numRows = 1", "[[1]]")],
    "generate", [["numRows", "int"]], "int[][]",
    ["1 ≤ numRows ≤ 30"], ["Each number is the sum of the two above it."]),

  q("Maximum Product Subarray", "Given an integer array nums, find a subarray that has the largest product, and return the product.", "medium", "Arrays",
    [e("nums = [2,3,-2,4]", "6", "Subarray [2,3] has largest product 6"), e("nums = [-2,0,-1]", "0")],
    "maxProduct", [["nums", "int[]"]], "int",
    ["1 ≤ nums.length ≤ 2 × 10^4"], ["Track both max and min products (a negative × negative = positive)."]),

  // ── STRINGS (15) ───────────────────────────────────────────────────

  q("Valid Anagram", "Given two strings s and t, return true if t is an anagram of s, and false otherwise. An anagram uses all original letters exactly once.", "easy", "Strings",
    [e("s = \"anagram\", t = \"nagaram\"", "true"), e("s = \"rat\", t = \"car\"", "false")],
    "isAnagram", [["s", "string"], ["t", "string"]], "bool",
    ["1 ≤ s.length, t.length ≤ 5 × 10^4"], ["Count character frequencies."]),

  q("Valid Palindrome", "Given a string s, return true if it is a palindrome after converting to lowercase and removing non-alphanumeric characters.", "easy", "Strings",
    [e("s = \"A man, a plan, a canal: Panama\"", "true"), e("s = \"race a car\"", "false")],
    "isPalindrome", [["s", "string"]], "bool",
    ["1 ≤ s.length ≤ 2 × 10^5"], ["Use two pointers from both ends."]),

  q("Longest Common Prefix", "Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string.", "easy", "Strings",
    [e("strs = [\"flower\",\"flow\",\"flight\"]", "\"fl\""), e("strs = [\"dog\",\"racecar\",\"car\"]", "\"\"")],
    "longestCommonPrefix", [["strs", "string[]"]], "string",
    ["1 ≤ strs.length ≤ 200", "0 ≤ strs[i].length ≤ 200"], ["Compare characters column by column."]),

  q("Roman to Integer", "Given a roman numeral string, convert it to an integer. Roman numerals: I=1, V=5, X=10, L=50, C=100, D=500, M=1000.", "easy", "Strings",
    [e("s = \"III\"", "3"), e("s = \"LVIII\"", "58"), e("s = \"MCMXCIV\"", "1994")],
    "romanToInt", [["s", "string"]], "int",
    ["1 ≤ s.length ≤ 15"], ["If a smaller value appears before a larger one, subtract it."]),

  q("First Unique Character in a String", "Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.", "easy", "Strings",
    [e("s = \"leetcode\"", "0"), e("s = \"loveleetcode\"", "2"), e("s = \"aabb\"", "-1")],
    "firstUniqChar", [["s", "string"]], "int",
    ["1 ≤ s.length ≤ 10^5"], ["Count chars, then find first with count 1."]),

  q("Reverse String", "Write a function that reverses a string. The input string is given as an array of characters s. You must do this in-place with O(1) extra memory.", "easy", "Strings",
    [e("s = [\"h\",\"e\",\"l\",\"l\",\"o\"]", "[\"o\",\"l\",\"l\",\"e\",\"h\"]"), e("s = [\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]", "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]")],
    "reverseString", [["s", "char[]"]], "void",
    ["1 ≤ s.length ≤ 10^5"], ["Swap from both ends."]),

  q("String to Integer (atoi)", "Implement the myAtoi function which converts a string to a 32-bit signed integer. Read and ignore leading whitespace, then an optional sign, then digits until non-digit or end.", "medium", "Strings",
    [e("s = \"42\"", "42"), e("s = \"   -42\"", "-42"), e("s = \"4193 with words\"", "4193")],
    "myAtoi", [["s", "string"]], "int",
    ["0 ≤ s.length ≤ 200"], ["Handle overflow by clamping to INT_MIN/INT_MAX."]),

  q("Count and Say", "The count-and-say sequence starts with \"1\", and each term describes the previous term. 1, 11, 21, 1211, 111221, ... Given n, return the nth term.", "medium", "Strings",
    [e("n = 1", "\"1\""), e("n = 4", "\"1211\"")],
    "countAndSay", [["n", "int"]], "string",
    ["1 ≤ n ≤ 30"], ["Build each term iteratively by counting consecutive chars."]),

  q("Group Anagrams", "Given an array of strings strs, group the anagrams together. You can return the answer in any order.", "medium", "Strings",
    [e("strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]"), e("strs = [\"\"]", "[[\"\"]]")],
    "groupAnagrams", [["strs", "string[]"]], "string[]",
    ["1 ≤ strs.length ≤ 10^4"], ["Sort each string as a key for grouping."]),

  q("Longest Palindromic Substring", "Given a string s, return the longest palindromic substring in s.", "medium", "Strings",
    [e("s = \"babad\"", "\"bab\"", "\"aba\" is also valid"), e("s = \"cbbd\"", "\"bb\"")],
    "longestPalindrome", [["s", "string"]], "string",
    ["1 ≤ s.length ≤ 1000"], ["Expand around center for each character."]),

  q("Zigzag Conversion", "Write the string in a zigzag pattern on a given number of rows, then read line by line. Given s and numRows, return the converted string.", "medium", "Strings",
    [e("s = \"PAYPALISHIRING\", numRows = 3", "\"PAHNAPLSIIGYIR\""), e("s = \"PAYPALISHIRING\", numRows = 4", "\"PINALSIGYAHRPI\"")],
    "convert", [["s", "string"], ["numRows", "int"]], "string",
    ["1 ≤ s.length ≤ 1000", "1 ≤ numRows ≤ 1000"], ["Simulate the zigzag using row buckets."]),

  q("Implement strStr()", "Return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.", "easy", "Strings",
    [e("haystack = \"sadbutsad\", needle = \"sad\"", "0"), e("haystack = \"leetcode\", needle = \"leeto\"", "-1")],
    "strStr", [["haystack", "string"], ["needle", "string"]], "int",
    ["1 ≤ haystack.length, needle.length ≤ 10^4"], ["Sliding window or KMP algorithm."]),

  q("Longest Substring Without Repeating Characters", "Given a string s, find the length of the longest substring without repeating characters.", "medium", "Strings",
    [e("s = \"abcabcbb\"", "3", "abc"), e("s = \"bbbbb\"", "1"), e("s = \"pwwkew\"", "3")],
    "lengthOfLongestSubstring", [["s", "string"]], "int",
    ["0 ≤ s.length ≤ 5 × 10^4"], ["Use sliding window with a set."]),

  q("Minimum Window Substring", "Given two strings s and t, return the minimum window substring of s that contains all characters of t. If no such window exists, return empty string.", "hard", "Strings",
    [e("s = \"ADOBECODEBANC\", t = \"ABC\"", "\"BANC\""), e("s = \"a\", t = \"a\"", "\"a\"")],
    "minWindow", [["s", "string"], ["t", "string"]], "string",
    ["1 ≤ s.length, t.length ≤ 10^5"], ["Use two pointers with a character frequency map."]),

  // ── TWO POINTERS (10) ──────────────────────────────────────────────

  q("Container With Most Water", "Given n non-negative integers representing heights of vertical lines, find two lines that together with the x-axis form a container that holds the most water.", "medium", "Two Pointers",
    [e("height = [1,8,6,2,5,4,8,3,7]", "49"), e("height = [1,1]", "1")],
    "maxArea", [["height", "int[]"]], "int",
    ["2 ≤ n ≤ 10^5", "0 ≤ height[i] ≤ 10^4"], ["Start pointers at both ends, move the shorter one inward."]),

  q("3Sum", "Given an integer array nums, return all triplets [nums[i], nums[j], nums[k]] such that i != j != k and nums[i] + nums[j] + nums[k] == 0. No duplicate triplets.", "medium", "Two Pointers",
    [e("nums = [-1,0,1,2,-1,-4]", "[[-1,-1,2],[-1,0,1]]"), e("nums = [0,1,1]", "[]")],
    "threeSum", [["nums", "int[]"]], "int[][]",
    ["-10^5 ≤ nums[i] ≤ 10^5", "3 ≤ nums.length ≤ 3000"], ["Sort first, then fix one number and use two pointers."]),

  q("Trapping Rain Water", "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.", "hard", "Two Pointers",
    [e("height = [0,1,0,2,1,0,1,3,2,1,2,1]", "6"), e("height = [4,2,0,3,2,5]", "9")],
    "trap", [["height", "int[]"]], "int",
    ["n == height.length", "0 ≤ height[i] ≤ 10^5"], ["Use two pointers tracking left max and right max."]),

  q("Sort Colors", "Given an array nums with n objects colored red (0), white (1), or blue (2), sort them in-place so that same colors are adjacent. Use only constant extra space.", "medium", "Two Pointers",
    [e("nums = [2,0,2,1,1,0]", "[0,0,1,1,2,2]"), e("nums = [2,0,1]", "[0,1,2]")],
    "sortColors", [["nums", "int[]"]], "void",
    ["1 ≤ n ≤ 300", "nums[i] is 0, 1, or 2"], ["Dutch National Flag algorithm with 3 pointers."]),

  q("Squares of a Sorted Array", "Given an integer array nums sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order.", "easy", "Two Pointers",
    [e("nums = [-4,-1,0,3,10]", "[0,1,9,16,100]"), e("nums = [-7,-3,2,3,11]", "[4,9,9,49,121]")],
    "sortedSquares", [["nums", "int[]"]], "int[]",
    ["1 ≤ nums.length ≤ 10^4"], ["Two pointers from both ends, compare absolute values."]),

  q("Backspace String Compare", "Given two strings s and t, return true if they are equal when both are typed into empty text editors. '#' means a backspace character.", "easy", "Two Pointers",
    [e("s = \"ab#c\", t = \"ad#c\"", "true", "Both become \"ac\""), e("s = \"ab##\", t = \"c#d#\"", "true")],
    "backspaceCompare", [["s", "string"], ["t", "string"]], "bool",
    ["1 ≤ s.length, t.length ≤ 200"], ["Process from right to left, counting backspaces."]),

  q("Two Sum II - Input Array Is Sorted", "Given a 1-indexed sorted array, find two numbers that add up to target. Return their indices as [index1, index2].", "medium", "Two Pointers",
    [e("numbers = [2,7,11,15], target = 9", "[1,2]"), e("numbers = [2,3,4], target = 6", "[1,3]")],
    "twoSumSorted", [["numbers", "int[]"], ["target", "int"]], "int[]",
    ["2 ≤ numbers.length ≤ 3 × 10^4"], ["Use left and right pointers."]),

  q("Is Subsequence", "Given two strings s and t, return true if s is a subsequence of t. A subsequence can be derived by deleting some characters without changing the relative order.", "easy", "Two Pointers",
    [e("s = \"abc\", t = \"ahbgdc\"", "true"), e("s = \"axc\", t = \"ahbgdc\"", "false")],
    "isSubsequence", [["s", "string"], ["t", "string"]], "bool",
    ["0 ≤ s.length ≤ 100", "0 ≤ t.length ≤ 10^4"], ["Use two pointers, one for each string."]),

  q("Remove Element", "Given an integer array nums and a value val, remove all occurrences of val in-place. Return the number of elements not equal to val.", "easy", "Two Pointers",
    [e("nums = [3,2,2,3], val = 3", "2", "nums = [2,2,_,_]"), e("nums = [0,1,2,2,3,0,4,2], val = 2", "5")],
    "removeElement", [["nums", "int[]"], ["val", "int"]], "int",
    ["0 ≤ nums.length ≤ 100"], ["Overwrite elements to keep."]),

  q("Remove Duplicates from Sorted Array II", "Given a sorted array, remove some duplicates in-place such that each unique element appears at most twice. Return the new length.", "medium", "Two Pointers",
    [e("nums = [1,1,1,2,2,3]", "5", "nums = [1,1,2,2,3,_]"), e("nums = [0,0,1,1,1,1,2,3,3]", "7")],
    "removeDuplicatesII", [["nums", "int[]"]], "int",
    ["1 ≤ nums.length ≤ 3 × 10^4"], ["Keep a slow pointer; allow at most 2 of the same."]),

  // ── SLIDING WINDOW (8) ─────────────────────────────────────────────

  q("Maximum Average Subarray I", "Given an integer array nums and an integer k, find the contiguous subarray of length k that has the maximum average value. Return the maximum average.", "easy", "Sliding Window",
    [e("nums = [1,12,-5,-6,50,3], k = 4", "12.75"), e("nums = [5], k = 1", "5.0")],
    "findMaxAverage", [["nums", "int[]"], ["k", "int"]], "float",
    ["1 ≤ k ≤ nums.length ≤ 10^5"], ["Sliding window: add new element, subtract old."]),

  q("Minimum Size Subarray Sum", "Given an array of positive integers and a target, return the minimal length of a subarray whose sum is greater than or equal to target. If none exists, return 0.", "medium", "Sliding Window",
    [e("target = 7, nums = [2,3,1,2,4,3]", "2", "Subarray [4,3]"), e("target = 11, nums = [1,1,1,1,1,1,1,1]", "0")],
    "minSubArrayLen", [["target", "int"], ["nums", "int[]"]], "int",
    ["1 ≤ nums.length ≤ 10^5"], ["Expand right, shrink left when sum >= target."]),

  q("Fruit Into Baskets", "You are visiting a farm with a row of fruit trees. You have two baskets and each basket can only hold one type of fruit. Return the maximum number of fruits you can pick.", "medium", "Sliding Window",
    [e("fruits = [1,2,1]", "3"), e("fruits = [0,1,2,2]", "3"), e("fruits = [1,2,3,2,2]", "4")],
    "totalFruit", [["fruits", "int[]"]], "int",
    ["1 ≤ fruits.length ≤ 10^5"], ["Sliding window with at most 2 distinct types."]),

  q("Permutation in String", "Given two strings s1 and s2, return true if s2 contains a permutation of s1. In other words, return true if one of s1's permutations is a substring of s2.", "medium", "Sliding Window",
    [e("s1 = \"ab\", s2 = \"eidbaooo\"", "true"), e("s1 = \"ab\", s2 = \"eidboaoo\"", "false")],
    "checkInclusion", [["s1", "string"], ["s2", "string"]], "bool",
    ["1 ≤ s1.length, s2.length ≤ 10^4"], ["Fixed-size sliding window matching char frequencies."]),

  q("Find All Anagrams in a String", "Given two strings s and p, return an array of all the start indices of p's anagrams in s.", "medium", "Sliding Window",
    [e("s = \"cbaebabacd\", p = \"abc\"", "[0,6]"), e("s = \"abab\", p = \"ab\"", "[0,1,2]")],
    "findAnagrams", [["s", "string"], ["p", "string"]], "int[]",
    ["1 ≤ s.length, p.length ≤ 3 × 10^4"], ["Sliding window of size p.length, compare frequency arrays."]),

  q("Sliding Window Maximum", "Given an array nums and a sliding window of size k, return the max value in each window position as the window slides from left to right.", "hard", "Sliding Window",
    [e("nums = [1,3,-1,-3,5,3,6,7], k = 3", "[3,3,5,5,6,7]"), e("nums = [1], k = 1", "[1]")],
    "maxSlidingWindow", [["nums", "int[]"], ["k", "int"]], "int[]",
    ["1 ≤ nums.length ≤ 10^5", "1 ≤ k ≤ nums.length"], ["Use a monotonic decreasing deque."]),

  q("Max Consecutive Ones III", "Given a binary array nums and an integer k, return the maximum number of consecutive 1's if you can flip at most k 0's.", "medium", "Sliding Window",
    [e("nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2", "6"), e("nums = [0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1], k = 3", "10")],
    "longestOnes", [["nums", "int[]"], ["k", "int"]], "int",
    ["1 ≤ nums.length ≤ 10^5"], ["Sliding window: count zeros, shrink when zeros > k."]),

  q("Longest Repeating Character Replacement", "Given a string s and an integer k, you can replace at most k characters. Return the length of the longest substring containing the same letter after replacements.", "medium", "Sliding Window",
    [e("s = \"ABAB\", k = 2", "4"), e("s = \"AABABBA\", k = 1", "4")],
    "characterReplacement", [["s", "string"], ["k", "int"]], "int",
    ["1 ≤ s.length ≤ 10^5"], ["Window size - max freq char count ≤ k."]),

  // ── STACK & QUEUE (10) ─────────────────────────────────────────────

  q("Valid Parentheses", "Given a string containing just '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Open brackets must be closed in the correct order.", "easy", "Stack",
    [e("s = \"()\"", "true"), e("s = \"()[]{}\"", "true"), e("s = \"(]\"", "false")],
    "isValid", [["s", "string"]], "bool",
    ["1 ≤ s.length ≤ 10^4"], ["Push opening brackets, pop and match closing brackets."]),

  q("Min Stack", "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.", "medium", "Stack",
    [e("push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()", "getMin=-3, top=0, getMin=-2")],
    "MinStack", [], "void",
    [], ["Use an auxiliary stack to track minimums."]),

  q("Evaluate Reverse Polish Notation", "Evaluate the value of an arithmetic expression in Reverse Polish Notation. Valid operators are +, -, *, /. Each operand may be an integer or another expression.", "medium", "Stack",
    [e("tokens = [\"2\",\"1\",\"+\",\"3\",\"*\"]", "9", "((2+1)*3)=9"), e("tokens = [\"4\",\"13\",\"5\",\"/\",\"+\"]", "6")],
    "evalRPN", [["tokens", "string[]"]], "int",
    ["1 ≤ tokens.length ≤ 10^4"], ["Use a stack; push numbers, pop two for operators."]),

  q("Daily Temperatures", "Given an array of daily temperatures, return an array such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If no future warmer day, put 0.", "medium", "Stack",
    [e("temperatures = [73,74,75,71,69,72,76,73]", "[1,1,4,2,1,1,0,0]"), e("temperatures = [30,40,50,60]", "[1,1,1,0]")],
    "dailyTemperatures", [["temperatures", "int[]"]], "int[]",
    ["1 ≤ temperatures.length ≤ 10^5"], ["Use a monotonic decreasing stack of indices."]),

  q("Next Greater Element I", "Given two arrays nums1 and nums2 where nums1 is a subset of nums2, find the next greater element for each nums1[i] in nums2. If no greater element exists, output -1.", "easy", "Stack",
    [e("nums1 = [4,1,2], nums2 = [1,3,4,2]", "[-1,3,-1]"), e("nums1 = [2,4], nums2 = [1,2,3,4]", "[3,-1]")],
    "nextGreaterElement", [["nums1", "int[]"], ["nums2", "int[]"]], "int[]",
    ["1 ≤ nums1.length ≤ nums2.length ≤ 1000"], ["Use a stack on nums2 and store results in a map."]),

  q("Implement Queue using Stacks", "Implement a FIFO queue using only two stacks. The queue should support push, pop, peek, and empty.", "easy", "Stack",
    [e("push(1), push(2), peek(), pop(), empty()", "peek=1, pop=1, empty=false")],
    "MyQueue", [], "void",
    [], ["Use one stack for input, another for output."]),

  q("Asteroid Collision", "Given an array of integers representing asteroids in a row. For each asteroid, the absolute value represents its size. Positive means moving right, negative means moving left. Return the state after all collisions.", "medium", "Stack",
    [e("asteroids = [5,10,-5]", "[5,10]"), e("asteroids = [8,-8]", "[]"), e("asteroids = [10,2,-5]", "[10]")],
    "asteroidCollision", [["asteroids", "int[]"]], "int[]",
    ["2 ≤ asteroids.length ≤ 10^4"], ["Use a stack; collisions happen when top is positive and incoming is negative."]),

  q("Decode String", "Given an encoded string like k[encoded_string], return the decoded string. Example: 3[a2[c]] decodes to accaccacc.", "medium", "Stack",
    [e("s = \"3[a]2[bc]\"", "\"aaabcbc\""), e("s = \"3[a2[c]]\"", "\"accaccacc\"")],
    "decodeString", [["s", "string"]], "string",
    ["1 ≤ s.length ≤ 30"], ["Use a stack to handle nested brackets."]),

  q("Basic Calculator II", "Given a string s representing a mathematical expression with +, -, *, / and non-negative integers, evaluate it. Integer division truncates toward zero.", "medium", "Stack",
    [e("s = \"3+2*2\"", "7"), e("s = \" 3/2 \"", "1"), e("s = \" 3+5 / 2 \"", "5")],
    "calculate", [["s", "string"]], "int",
    ["1 ≤ s.length ≤ 3 × 10^5"], ["Process * and / immediately, defer + and - to a stack."]),

  q("Largest Rectangle in Histogram", "Given an array of integers heights representing a histogram, find the area of the largest rectangle in the histogram.", "hard", "Stack",
    [e("heights = [2,1,5,6,2,3]", "10"), e("heights = [2,4]", "4")],
    "largestRectangleArea", [["heights", "int[]"]], "int",
    ["1 ≤ heights.length ≤ 10^5"], ["Use a stack to find the previous and next smaller elements."]),

  // ── LINKED LIST (10) ───────────────────────────────────────────────
  // Note: using int[] to represent linked lists for simplicity

  q("Reverse Linked List", "Given the head of a singly linked list represented as an array, return the reversed list. Example: [1,2,3,4,5] → [5,4,3,2,1].", "easy", "Linked List",
    [e("head = [1,2,3,4,5]", "[5,4,3,2,1]"), e("head = [1,2]", "[2,1]")],
    "reverseList", [["head", "int[]"]], "int[]",
    ["0 ≤ list length ≤ 5000"], ["Iteratively reverse pointers or use recursion."]),

  q("Merge Two Sorted Lists", "Given two sorted arrays (representing linked lists), merge them into one sorted array.", "easy", "Linked List",
    [e("list1 = [1,2,4], list2 = [1,3,4]", "[1,1,2,3,4,4]"), e("list1 = [], list2 = [0]", "[0]")],
    "mergeTwoLists", [["list1", "int[]"], ["list2", "int[]"]], "int[]",
    ["0 ≤ list lengths ≤ 50"], ["Use two pointers to compare and merge."]),

  q("Linked List Cycle Detection", "Given an array of integers, determine if there's any duplicate value (simulating a cycle). Return true if a value repeats.", "easy", "Linked List",
    [e("head = [3,2,0,-4,2]", "true", "Value 2 repeats"), e("head = [1,2,3]", "false")],
    "hasCycle", [["head", "int[]"]], "bool",
    ["0 ≤ list length ≤ 10^4"], ["Floyd's cycle detection with fast and slow pointers."]),

  q("Remove Nth Node From End of List", "Given an array and n, remove the nth element from the end and return the result.", "medium", "Linked List",
    [e("head = [1,2,3,4,5], n = 2", "[1,2,3,5]"), e("head = [1], n = 1", "[]")],
    "removeNthFromEnd", [["head", "int[]"], ["n", "int"]], "int[]",
    ["1 ≤ list length ≤ 30"], ["Use two pointers with n gap between them."]),

  q("Add Two Numbers", "Given two non-empty arrays representing two non-negative integers stored in reverse order, add them and return the result as an array in reverse order.", "medium", "Linked List",
    [e("l1 = [2,4,3], l2 = [5,6,4]", "[7,0,8]", "342 + 465 = 807"), e("l1 = [9,9,9], l2 = [1]", "[0,0,0,1]")],
    "addTwoNumbers", [["l1", "int[]"], ["l2", "int[]"]], "int[]",
    ["1 ≤ list length ≤ 100", "0 ≤ Node.val ≤ 9"], ["Process digits with carry."]),

  q("Intersection of Two Linked Lists", "Given two arrays, return the first common element, or -1 if none.", "easy", "Linked List",
    [e("listA = [4,1,8,4,5], listB = [5,6,1,8,4,5]", "8"), e("listA = [2,6,4], listB = [1,5]", "-1")],
    "getIntersectionNode", [["listA", "int[]"], ["listB", "int[]"]], "int",
    ["1 ≤ list lengths ≤ 3 × 10^4"], ["Find the first common element using a set."]),

  q("Palindrome Linked List", "Given an array (representing a linked list), return true if it is a palindrome.", "easy", "Linked List",
    [e("head = [1,2,2,1]", "true"), e("head = [1,2]", "false")],
    "isPalindromeList", [["head", "int[]"]], "bool",
    ["1 ≤ list length ≤ 10^5"], ["Reverse second half and compare, or use a stack."]),

  q("Reorder List", "Given an array [L0, L1, ..., Ln], reorder it to [L0, Ln, L1, Ln-1, L2, Ln-2, ...].", "medium", "Linked List",
    [e("head = [1,2,3,4]", "[1,4,2,3]"), e("head = [1,2,3,4,5]", "[1,5,2,4,3]")],
    "reorderList", [["head", "int[]"]], "int[]",
    ["1 ≤ list length ≤ 5 × 10^4"], ["Find middle, reverse second half, merge alternately."]),

  q("Sort List", "Given an array (representing a linked list), sort it in ascending order.", "medium", "Linked List",
    [e("head = [4,2,1,3]", "[1,2,3,4]"), e("head = [-1,5,3,4,0]", "[-1,0,3,4,5]")],
    "sortList", [["head", "int[]"]], "int[]",
    ["0 ≤ list length ≤ 5 × 10^4"], ["Merge sort for O(n log n)."]),

  q("Odd Even Linked List", "Group all odd-indexed nodes together followed by even-indexed nodes. The first node is considered odd. Return the reordered array.", "medium", "Linked List",
    [e("head = [1,2,3,4,5]", "[1,3,5,2,4]"), e("head = [2,1,3,5,6,4,7]", "[2,3,6,7,1,5,4]")],
    "oddEvenList", [["head", "int[]"]], "int[]",
    ["0 ≤ n ≤ 10^4"], ["Use two pointers: one for odd indices, one for even."]),

  // ── BINARY SEARCH (10) ─────────────────────────────────────────────

  q("Binary Search", "Given a sorted array of integers nums and a target value, return the index if found, otherwise return -1.", "easy", "Binary Search",
    [e("nums = [-1,0,3,5,9,12], target = 9", "4"), e("nums = [-1,0,3,5,9,12], target = 2", "-1")],
    "search", [["nums", "int[]"], ["target", "int"]], "int",
    ["1 ≤ nums.length ≤ 10^4"], ["Standard binary search with left and right pointers."]),

  q("Search Insert Position", "Given a sorted array and a target value, return the index if found. If not, return the index where it would be inserted.", "easy", "Binary Search",
    [e("nums = [1,3,5,6], target = 5", "2"), e("nums = [1,3,5,6], target = 2", "1"), e("nums = [1,3,5,6], target = 7", "4")],
    "searchInsert", [["nums", "int[]"], ["target", "int"]], "int",
    ["1 ≤ nums.length ≤ 10^4"], ["Binary search for the leftmost position."]),

  q("Find First and Last Position", "Given a sorted array and a target, find the starting and ending position. If not found, return [-1, -1].", "medium", "Binary Search",
    [e("nums = [5,7,7,8,8,10], target = 8", "[3,4]"), e("nums = [5,7,7,8,8,10], target = 6", "[-1,-1]")],
    "searchRange", [["nums", "int[]"], ["target", "int"]], "int[]",
    ["0 ≤ nums.length ≤ 10^5"], ["Two binary searches: one for left bound, one for right."]),

  q("Search in Rotated Sorted Array", "Given a rotated sorted array and a target, return its index or -1. The array was originally sorted in ascending order and then rotated at some pivot.", "medium", "Binary Search",
    [e("nums = [4,5,6,7,0,1,2], target = 0", "4"), e("nums = [4,5,6,7,0,1,2], target = 3", "-1")],
    "searchRotated", [["nums", "int[]"], ["target", "int"]], "int",
    ["1 ≤ nums.length ≤ 5000"], ["Determine which half is sorted, then decide which half to search."]),

  q("Find Peak Element", "A peak element is strictly greater than its neighbors. Given an array, find a peak element and return its index. The array may contain multiple peaks.", "medium", "Binary Search",
    [e("nums = [1,2,3,1]", "2"), e("nums = [1,2,1,3,5,6,4]", "5")],
    "findPeakElement", [["nums", "int[]"]], "int",
    ["1 ≤ nums.length ≤ 1000"], ["Binary search: go toward the higher neighbor."]),

  q("First Bad Version", "You have n versions [1, 2, ..., n] and you want to find the first bad one using isBadVersion(version) API. Minimize calls to the API.", "easy", "Binary Search",
    [e("n = 5, bad = 4", "4"), e("n = 1, bad = 1", "1")],
    "firstBadVersion", [["n", "int"]], "int",
    ["1 ≤ n ≤ 2^31 - 1"], ["Binary search between 1 and n."]),

  q("Sqrt(x)", "Given a non-negative integer x, return the square root of x rounded down to the nearest integer.", "easy", "Binary Search",
    [e("x = 4", "2"), e("x = 8", "2", "sqrt(8) = 2.828..., rounded down to 2")],
    "mySqrt", [["x", "int"]], "int",
    ["0 ≤ x ≤ 2^31 - 1"], ["Binary search: find largest n where n*n ≤ x."]),

  q("Koko Eating Bananas", "Koko has n piles of bananas. She can eat at speed k bananas/hour (one pile at a time). Find the minimum k so she finishes all piles within h hours.", "medium", "Binary Search",
    [e("piles = [3,6,7,11], h = 8", "4"), e("piles = [30,11,23,4,20], h = 5", "30")],
    "minEatingSpeed", [["piles", "int[]"], ["h", "int"]], "int",
    ["1 ≤ piles.length ≤ 10^4", "1 ≤ h ≤ 10^9"], ["Binary search on speed k from 1 to max(piles)."]),

  q("Search a 2D Matrix", "Write an efficient algorithm to search for a value in an m x n integer matrix. Integers in each row are sorted. The first integer of each row is greater than the last of the previous row.", "medium", "Binary Search",
    [e("matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3", "true"), e("matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13", "false")],
    "searchMatrix", [["matrix", "int[][]"], ["target", "int"]], "bool",
    ["1 ≤ m, n ≤ 100"], ["Treat as a 1D sorted array and binary search."]),

  q("Find Minimum in Rotated Sorted Array", "Given a rotated sorted array of unique elements, find the minimum element.", "medium", "Binary Search",
    [e("nums = [3,4,5,1,2]", "1"), e("nums = [4,5,6,7,0,1,2]", "0"), e("nums = [11,13,15,17]", "11")],
    "findMin", [["nums", "int[]"]], "int",
    ["1 ≤ n ≤ 5000"], ["Binary search: compare mid with right endpoint."]),

  // ── TREES (15) ─────────────────────────────────────────────────────
  // Represented as arrays (level-order): [1, 2, 3, null, 4]

  q("Maximum Depth of Binary Tree", "Given a binary tree represented as a level-order array (use -1 for null), return its maximum depth.", "easy", "Trees",
    [e("root = [3,9,20,-1,-1,15,7]", "3"), e("root = [1,-1,2]", "2")],
    "maxDepth", [["root", "int[]"]], "int",
    ["0 ≤ number of nodes ≤ 10^4"], ["Use DFS or BFS, counting levels."]),

  q("Invert Binary Tree", "Given a binary tree as a level-order array, invert (mirror) it and return the result.", "easy", "Trees",
    [e("root = [4,2,7,1,3,6,9]", "[4,7,2,9,6,3,1]"), e("root = [2,1,3]", "[2,3,1]")],
    "invertTree", [["root", "int[]"]], "int[]",
    ["0 ≤ number of nodes ≤ 100"], ["Recursively swap left and right children."]),

  q("Symmetric Tree", "Given a binary tree as a level-order array, check whether it is a mirror of itself (symmetric around its center).", "easy", "Trees",
    [e("root = [1,2,2,3,4,4,3]", "true"), e("root = [1,2,2,-1,3,-1,3]", "false")],
    "isSymmetric", [["root", "int[]"]], "bool",
    ["0 ≤ number of nodes ≤ 1000"], ["Compare left subtree with mirror of right subtree."]),

  q("Binary Tree Level Order Traversal", "Given a binary tree as a level-order array, return the level order traversal as a list of lists.", "medium", "Trees",
    [e("root = [3,9,20,-1,-1,15,7]", "[[3],[9,20],[15,7]]"), e("root = [1]", "[[1]]")],
    "levelOrder", [["root", "int[]"]], "int[][]",
    ["0 ≤ number of nodes ≤ 2000"], ["Use BFS with a queue, processing level by level."]),

  q("Validate Binary Search Tree", "Given a binary tree (level-order array), determine if it is a valid BST. A valid BST has all left descendants < node < all right descendants.", "medium", "Trees",
    [e("root = [2,1,3]", "true"), e("root = [5,1,4,-1,-1,3,6]", "false")],
    "isValidBST", [["root", "int[]"]], "bool",
    ["1 ≤ number of nodes ≤ 10^4"], ["Use in-order traversal and check if values are strictly increasing."]),

  q("Lowest Common Ancestor", "Given a binary tree and two node values p and q, find their lowest common ancestor. The LCA is the deepest node that has both p and q as descendants.", "medium", "Trees",
    [e("root = [3,5,1,6,2,0,8,-1,-1,7,4], p = 5, q = 1", "3"), e("root = [3,5,1,6,2,0,8,-1,-1,7,4], p = 5, q = 4", "5")],
    "lowestCommonAncestor", [["root", "int[]"], ["p", "int"], ["q", "int"]], "int",
    ["2 ≤ number of nodes ≤ 10^5"], ["Recursively search both subtrees."]),

  q("Path Sum", "Given a binary tree and a target sum, return true if there is a root-to-leaf path where values sum to target.", "easy", "Trees",
    [e("root = [5,4,8,11,-1,13,4,7,2,-1,-1,-1,1], targetSum = 22", "true"), e("root = [1,2,3], targetSum = 5", "false")],
    "hasPathSum", [["root", "int[]"], ["targetSum", "int"]], "bool",
    ["0 ≤ number of nodes ≤ 5000"], ["DFS subtracting each node's value from target."]),

  q("Binary Tree Inorder Traversal", "Given a binary tree as a level-order array, return the inorder traversal (left, root, right).", "easy", "Trees",
    [e("root = [1,-1,2,3]", "[1,3,2]"), e("root = []", "[]"), e("root = [1]", "[1]")],
    "inorderTraversal", [["root", "int[]"]], "int[]",
    ["0 ≤ number of nodes ≤ 100"], ["Recursive or iterative with a stack."]),

  q("Diameter of Binary Tree", "Given a binary tree, return the length of the diameter. The diameter is the longest path between any two nodes (number of edges).", "easy", "Trees",
    [e("root = [1,2,3,4,5]", "3", "Path: 4→2→1→3 or 5→2→1→3"), e("root = [1,2]", "1")],
    "diameterOfBinaryTree", [["root", "int[]"]], "int",
    ["1 ≤ number of nodes ≤ 10^4"], ["For each node, diameter through it = left depth + right depth."]),

  q("Subtree of Another Tree", "Given two binary trees root and subRoot (as arrays), return true if subRoot is a subtree of root.", "easy", "Trees",
    [e("root = [3,4,5,1,2], subRoot = [4,1,2]", "true"), e("root = [3,4,5,1,2,-1,-1,-1,-1,0], subRoot = [4,1,2]", "false")],
    "isSubtree", [["root", "int[]"], ["subRoot", "int[]"]], "bool",
    ["1 ≤ root nodes ≤ 2000", "1 ≤ subRoot nodes ≤ 1000"], ["Check each node if it matches subRoot."]),

  q("Same Tree", "Given two binary trees as level-order arrays, check if they are structurally identical and have the same node values.", "easy", "Trees",
    [e("p = [1,2,3], q = [1,2,3]", "true"), e("p = [1,2], q = [1,-1,2]", "false")],
    "isSameTree", [["p", "int[]"], ["q", "int[]"]], "bool",
    ["0 ≤ number of nodes ≤ 100"], ["Compare nodes recursively or iteratively."]),

  q("Balanced Binary Tree", "Given a binary tree (as array), determine if it is height-balanced. A height-balanced tree's subtrees' depths never differ by more than 1.", "easy", "Trees",
    [e("root = [3,9,20,-1,-1,15,7]", "true"), e("root = [1,2,2,3,3,-1,-1,4,4]", "false")],
    "isBalanced", [["root", "int[]"]], "bool",
    ["0 ≤ number of nodes ≤ 5000"], ["Bottom-up: get height and check balance at each node."]),

  q("Binary Tree Right Side View", "Given a binary tree, imagine yourself standing on the right side. Return the values of the nodes you can see ordered from top to bottom.", "medium", "Trees",
    [e("root = [1,2,3,-1,5,-1,4]", "[1,3,4]"), e("root = [1,-1,3]", "[1,3]")],
    "rightSideView", [["root", "int[]"]], "int[]",
    ["0 ≤ number of nodes ≤ 100"], ["BFS: take the last node at each level."]),

  q("Kth Smallest Element in a BST", "Given a BST (as array) and an integer k, return the kth smallest value in the BST.", "medium", "Trees",
    [e("root = [3,1,4,-1,2], k = 1", "1"), e("root = [5,3,6,2,4,-1,-1,1], k = 3", "3")],
    "kthSmallest", [["root", "int[]"], ["k", "int"]], "int",
    ["1 ≤ k ≤ n ≤ 10^4"], ["In-order traversal gives sorted order; pick kth."]),

  q("Binary Tree Zigzag Level Order", "Given a binary tree, return the zigzag level order traversal (i.e., from left to right, then right to left for the next level, alternating).", "medium", "Trees",
    [e("root = [3,9,20,-1,-1,15,7]", "[[3],[20,9],[15,7]]"), e("root = [1]", "[[1]]")],
    "zigzagLevelOrder", [["root", "int[]"]], "int[][]",
    ["0 ≤ number of nodes ≤ 2000"], ["BFS with a flag to reverse every other level."]),

  // ── GRAPHS (10) ────────────────────────────────────────────────────

  q("Number of Islands", "Given an m x n 2D grid of '1's (land) and '0's (water), count the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.", "medium", "Graphs",
    [e("grid = [[1,1,1,1,0],[1,1,0,1,0],[1,1,0,0,0],[0,0,0,0,0]]", "1"), e("grid = [[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,0,0,1,1]]", "3")],
    "numIslands", [["grid", "int[][]"]], "int",
    ["1 ≤ m, n ≤ 300"], ["DFS/BFS from each unvisited '1', mark visited."]),

  q("Course Schedule", "There are numCourses courses (0 to numCourses-1). Some have prerequisites given as [a, b] meaning you must take b before a. Return true if you can finish all courses.", "medium", "Graphs",
    [e("numCourses = 2, prerequisites = [[1,0]]", "true"), e("numCourses = 2, prerequisites = [[1,0],[0,1]]", "false")],
    "canFinish", [["numCourses", "int"], ["prerequisites", "int[][]"]], "bool",
    ["1 ≤ numCourses ≤ 2000"], ["Topological sort or cycle detection with DFS."]),

  q("Rotting Oranges", "Given a grid where 0=empty, 1=fresh orange, 2=rotten orange, every minute each rotten orange rots adjacent fresh oranges. Return the minimum minutes until no fresh orange remains, or -1 if impossible.", "medium", "Graphs",
    [e("grid = [[2,1,1],[1,1,0],[0,1,1]]", "4"), e("grid = [[2,1,1],[0,1,1],[1,0,1]]", "-1")],
    "orangesRotting", [["grid", "int[][]"]], "int",
    ["1 ≤ m, n ≤ 10"], ["Multi-source BFS from all initially rotten oranges."]),

  q("Surrounded Regions", "Given an m x n board containing 'X' and 'O', capture all regions of 'O' that are completely surrounded by 'X'. A region is captured by flipping all 'O's to 'X's.", "medium", "Graphs",
    [e("board = [[X,X,X,X],[X,O,O,X],[X,X,O,X],[X,O,X,X]]", "[[X,X,X,X],[X,X,X,X],[X,X,X,X],[X,O,X,X]]")],
    "solve", [["board", "string[]"]], "void",
    ["1 ≤ m, n ≤ 200"], ["DFS from border 'O's to mark safe ones, then flip the rest."]),

  q("Pacific Atlantic Water Flow", "Given an m x n grid of heights, water can flow to adjacent cells with equal or lower height. The Pacific ocean touches the left and top edges, the Atlantic touches the right and bottom edges. Return all cells where water can flow to both oceans.", "medium", "Graphs",
    [e("heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]", "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]")],
    "pacificAtlantic", [["heights", "int[][]"]], "int[][]",
    ["1 ≤ m, n ≤ 200"], ["BFS/DFS from both ocean borders, find intersection."]),

  q("Word Ladder", "Given two words beginWord and endWord, and a dictionary, find the length of the shortest transformation sequence from beginWord to endWord, changing one letter at a time. Each intermediate word must be in the dictionary.", "hard", "Graphs",
    [e("beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]", "5"), e("beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\"]", "0")],
    "ladderLength", [["beginWord", "string"], ["endWord", "string"], ["wordList", "string[]"]], "int",
    ["1 ≤ beginWord.length ≤ 10"], ["BFS: each word is a node, edges connect words differing by one letter."]),

  q("Clone Graph", "Given a reference of a node in a connected undirected graph, return a deep copy. The graph is given as an adjacency list. Return the adjacency list of the clone.", "medium", "Graphs",
    [e("adjList = [[2,4],[1,3],[2,4],[1,3]]", "[[2,4],[1,3],[2,4],[1,3]]"), e("adjList = [[]]", "[[]]")],
    "cloneGraph", [["adjList", "int[][]"]], "int[][]",
    ["0 ≤ number of nodes ≤ 100"], ["BFS/DFS with a hash map to track cloned nodes."]),

  q("Course Schedule II", "Given numCourses and prerequisites, return a valid order to take all courses. If impossible, return an empty array.", "medium", "Graphs",
    [e("numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]", "[0,1,2,3]"), e("numCourses = 1, prerequisites = []", "[0]")],
    "findOrder", [["numCourses", "int"], ["prerequisites", "int[][]"]], "int[]",
    ["1 ≤ numCourses ≤ 2000"], ["Topological sort using Kahn's algorithm (BFS)."]),

  q("Number of Connected Components", "Given n nodes labeled 0 to n-1 and a list of undirected edges, find the number of connected components.", "medium", "Graphs",
    [e("n = 5, edges = [[0,1],[1,2],[3,4]]", "2"), e("n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]", "1")],
    "countComponents", [["n", "int"], ["edges", "int[][]"]], "int",
    ["1 ≤ n ≤ 2000"], ["Union-Find or DFS/BFS from each unvisited node."]),

  q("Detect Cycle in Directed Graph", "Given n nodes and directed edges, determine if the graph contains a cycle.", "medium", "Graphs",
    [e("n = 4, edges = [[0,1],[1,2],[2,3]]", "false"), e("n = 3, edges = [[0,1],[1,2],[2,0]]", "true")],
    "hasCycleDirected", [["n", "int"], ["edges", "int[][]"]], "bool",
    ["1 ≤ n ≤ 2000"], ["DFS with three states: unvisited, in-progress, visited."]),

  // ── DYNAMIC PROGRAMMING (15) ──────────────────────────────────────

  q("Climbing Stairs", "You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?", "easy", "Dynamic Programming",
    [e("n = 2", "2", "1+1 or 2"), e("n = 3", "3", "1+1+1, 1+2, or 2+1")],
    "climbStairs", [["n", "int"]], "int",
    ["1 ≤ n ≤ 45"], ["dp[i] = dp[i-1] + dp[i-2]. Same as Fibonacci."]),

  q("Coin Change", "Given coins of different denominations and a total amount, find the fewest number of coins needed to make that amount. If impossible, return -1.", "medium", "Dynamic Programming",
    [e("coins = [1,5,11], amount = 11", "1"), e("coins = [2], amount = 3", "-1")],
    "coinChange", [["coins", "int[]"], ["amount", "int"]], "int",
    ["1 ≤ coins.length ≤ 12", "0 ≤ amount ≤ 10^4"], ["dp[i] = min(dp[i - coin] + 1) for each coin."]),

  q("Longest Increasing Subsequence", "Given an integer array nums, return the length of the longest strictly increasing subsequence.", "medium", "Dynamic Programming",
    [e("nums = [10,9,2,5,3,7,101,18]", "4", "[2,3,7,101]"), e("nums = [0,1,0,3,2,3]", "4")],
    "lengthOfLIS", [["nums", "int[]"]], "int",
    ["1 ≤ nums.length ≤ 2500"], ["dp[i] = max(dp[j] + 1) for j < i where nums[j] < nums[i]."]),

  q("House Robber", "You are a robber planning to rob houses along a street. Adjacent houses have connected security systems. Given an array of money in each house, return the maximum amount you can rob without robbing two adjacent houses.", "medium", "Dynamic Programming",
    [e("nums = [1,2,3,1]", "4", "Rob house 1 and 3"), e("nums = [2,7,9,3,1]", "12")],
    "rob", [["nums", "int[]"]], "int",
    ["1 ≤ nums.length ≤ 100"], ["dp[i] = max(dp[i-1], dp[i-2] + nums[i])."]),

  q("Unique Paths", "A robot is at the top-left corner of an m x n grid and can only move right or down. How many unique paths are there to reach the bottom-right corner?", "medium", "Dynamic Programming",
    [e("m = 3, n = 7", "28"), e("m = 3, n = 2", "3")],
    "uniquePaths", [["m", "int"], ["n", "int"]], "int",
    ["1 ≤ m, n ≤ 100"], ["dp[i][j] = dp[i-1][j] + dp[i][j-1]."]),

  q("Jump Game", "Given an integer array nums where nums[i] is the maximum jump length from position i, determine if you can reach the last index.", "medium", "Dynamic Programming",
    [e("nums = [2,3,1,1,4]", "true"), e("nums = [3,2,1,0,4]", "false")],
    "canJump", [["nums", "int[]"]], "bool",
    ["1 ≤ nums.length ≤ 10^4"], ["Track the farthest reachable index greedily."]),

  q("Word Break", "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.", "medium", "Dynamic Programming",
    [e("s = \"leetcode\", wordDict = [\"leet\",\"code\"]", "true"), e("s = \"applepenapple\", wordDict = [\"apple\",\"pen\"]", "true")],
    "wordBreak", [["s", "string"], ["wordDict", "string[]"]], "bool",
    ["1 ≤ s.length ≤ 300"], ["dp[i] = true if s[0..i] can be segmented."]),

  q("Decode Ways", "A message encoded with A=1, B=2, ..., Z=26. Given an encoded string of digits, return the number of ways to decode it.", "medium", "Dynamic Programming",
    [e("s = \"12\"", "2", "AB (1,2) or L (12)"), e("s = \"226\"", "3"), e("s = \"06\"", "0")],
    "numDecodings", [["s", "string"]], "int",
    ["1 ≤ s.length ≤ 100"], ["dp[i] depends on whether s[i] and s[i-1..i] are valid."]),

  q("Partition Equal Subset Sum", "Given an integer array nums, return true if you can partition the array into two subsets such that the sum of elements in both subsets is equal.", "medium", "Dynamic Programming",
    [e("nums = [1,5,11,5]", "true", "[1,5,5] and [11]"), e("nums = [1,2,3,5]", "false")],
    "canPartition", [["nums", "int[]"]], "bool",
    ["1 ≤ nums.length ≤ 200"], ["0/1 Knapsack: can we reach sum/2?"]),

  q("Longest Common Subsequence", "Given two strings text1 and text2, return the length of their longest common subsequence. If no common subsequence, return 0.", "medium", "Dynamic Programming",
    [e("text1 = \"abcde\", text2 = \"ace\"", "3", "LCS is \"ace\""), e("text1 = \"abc\", text2 = \"def\"", "0")],
    "longestCommonSubsequence", [["text1", "string"], ["text2", "string"]], "int",
    ["1 ≤ text1.length, text2.length ≤ 1000"], ["2D DP: dp[i][j] = length of LCS of text1[0..i] and text2[0..j]."]),

  q("Edit Distance", "Given two strings word1 and word2, return the minimum number of operations (insert, delete, replace) required to convert word1 to word2.", "medium", "Dynamic Programming",
    [e("word1 = \"horse\", word2 = \"ros\"", "3"), e("word1 = \"intention\", word2 = \"execution\"", "5")],
    "minDistance", [["word1", "string"], ["word2", "string"]], "int",
    ["0 ≤ word1.length, word2.length ≤ 500"], ["dp[i][j] = min(insert, delete, replace)."]),

  q("Palindromic Substrings", "Given a string s, return the number of palindromic substrings in it. A substring is palindromic if it reads the same forward and backward.", "medium", "Dynamic Programming",
    [e("s = \"abc\"", "3", "a, b, c"), e("s = \"aaa\"", "6", "a, a, a, aa, aa, aaa")],
    "countSubstrings", [["s", "string"]], "int",
    ["1 ≤ s.length ≤ 1000"], ["Expand around center for each position."]),

  q("Fibonacci Number", "The Fibonacci numbers begin 0, 1, 1, 2, 3, 5, 8, ... Given n, calculate F(n).", "easy", "Dynamic Programming",
    [e("n = 2", "1"), e("n = 3", "2"), e("n = 4", "3")],
    "fib", [["n", "int"]], "int",
    ["0 ≤ n ≤ 30"], ["Use two variables to avoid recomputation."]),

  q("Min Cost Climbing Stairs", "Given an array cost where cost[i] is the cost of stepping on the ith step, you can start from step 0 or 1 and climb 1 or 2 steps at a time. Return the minimum cost to reach the top.", "easy", "Dynamic Programming",
    [e("cost = [10,15,20]", "15"), e("cost = [1,100,1,1,1,100,1,1,100,1]", "6")],
    "minCostClimbingStairs", [["cost", "int[]"]], "int",
    ["2 ≤ cost.length ≤ 1000"], ["dp[i] = cost[i] + min(dp[i-1], dp[i-2])."]),

  q("Maximum Length of Repeated Subarray", "Given two integer arrays nums1 and nums2, return the maximum length of a subarray that appears in both arrays.", "medium", "Dynamic Programming",
    [e("nums1 = [1,2,3,2,1], nums2 = [3,2,1,4,7]", "3", "Subarray [3,2,1]"), e("nums1 = [0,0,0,0,0], nums2 = [0,0,0,0,0]", "5")],
    "findLength", [["nums1", "int[]"], ["nums2", "int[]"]], "int",
    ["1 ≤ nums1.length, nums2.length ≤ 1000"], ["2D DP: dp[i][j] = length if nums1[i-1] == nums2[j-1]."]),

  // ── MATH & BIT MANIPULATION (10) ──────────────────────────────────

  q("Palindrome Number", "Given an integer x, return true if x is a palindrome (reads the same forward and backward). Negative numbers are not palindromes.", "easy", "Math",
    [e("x = 121", "true"), e("x = -121", "false"), e("x = 10", "false")],
    "isPalindromeNum", [["x", "int"]], "bool",
    ["-2^31 ≤ x ≤ 2^31 - 1"], ["Reverse half the number and compare."]),

  q("Fizz Buzz", "Given an integer n, return a string array answer where answer[i] is \"FizzBuzz\" if i is divisible by 3 and 5, \"Fizz\" if divisible by 3, \"Buzz\" if divisible by 5, or i as a string.", "easy", "Math",
    [e("n = 3", "[\"1\",\"2\",\"Fizz\"]"), e("n = 5", "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]")],
    "fizzBuzz", [["n", "int"]], "string[]",
    ["1 ≤ n ≤ 10^4"], ["Check divisibility by 15, then 3, then 5."]),

  q("Power of Two", "Given an integer n, return true if it is a power of two.", "easy", "Math",
    [e("n = 1", "true"), e("n = 16", "true"), e("n = 3", "false")],
    "isPowerOfTwo", [["n", "int"]], "bool",
    ["-2^31 ≤ n ≤ 2^31 - 1"], ["n & (n - 1) == 0 and n > 0."]),

  q("Missing Number", "Given an array nums containing n distinct numbers in the range [0, n], return the one number that is missing.", "easy", "Math",
    [e("nums = [3,0,1]", "2"), e("nums = [0,1]", "2"), e("nums = [9,6,4,2,3,5,7,0,1]", "8")],
    "missingNumber", [["nums", "int[]"]], "int",
    ["n == nums.length", "0 ≤ nums[i] ≤ n"], ["Use sum formula n*(n+1)/2, or XOR."]),

  q("Counting Bits", "Given an integer n, return an array of length n+1 where ans[i] is the number of 1's in the binary representation of i.", "easy", "Math",
    [e("n = 2", "[0,1,1]"), e("n = 5", "[0,1,1,2,1,2]")],
    "countBits", [["n", "int"]], "int[]",
    ["0 ≤ n ≤ 10^5"], ["dp[i] = dp[i >> 1] + (i & 1)."]),

  q("Reverse Integer", "Given a signed 32-bit integer x, return x with its digits reversed. If reversing causes overflow, return 0.", "medium", "Math",
    [e("x = 123", "321"), e("x = -123", "-321"), e("x = 120", "21")],
    "reverse", [["x", "int"]], "int",
    ["-2^31 ≤ x ≤ 2^31 - 1"], ["Pop digits with mod 10, check overflow before pushing."]),

  q("Number of 1 Bits", "Write a function that takes an unsigned integer and returns the number of '1' bits it has (Hamming weight).", "easy", "Math",
    [e("n = 11 (binary: 1011)", "3"), e("n = 128 (binary: 10000000)", "1")],
    "hammingWeight", [["n", "int"]], "int",
    ["Input is a 32-bit unsigned integer"], ["n & (n-1) removes the lowest set bit."]),

  q("Add Binary", "Given two binary strings a and b, return their sum as a binary string.", "easy", "Math",
    [e("a = \"11\", b = \"1\"", "\"100\""), e("a = \"1010\", b = \"1011\"", "\"10101\"")],
    "addBinary", [["a", "string"], ["b", "string"]], "string",
    ["1 ≤ a.length, b.length ≤ 10^4"], ["Process from right to left with carry."]),

  q("Happy Number", "A happy number is defined by replacing it by the sum of the squares of its digits, repeating until it equals 1 or loops endlessly. Return true if n is a happy number.", "easy", "Math",
    [e("n = 19", "true", "1²+9²=82, 8²+2²=68, 6²+8²=100, 1²+0²+0²=1"), e("n = 2", "false")],
    "isHappy", [["n", "int"]], "bool",
    ["1 ≤ n ≤ 2^31 - 1"], ["Use a set to detect cycles, or Floyd's algorithm."]),

  q("Excel Sheet Column Number", "Given a string columnTitle like 'A'=1, 'B'=2, ..., 'Z'=26, 'AA'=27, etc., return the corresponding column number.", "easy", "Math",
    [e("columnTitle = \"A\"", "1"), e("columnTitle = \"AB\"", "28"), e("columnTitle = \"ZY\"", "701")],
    "titleToNumber", [["columnTitle", "string"]], "int",
    ["1 ≤ columnTitle.length ≤ 7"], ["Treat as base-26 number."]),

  // ── SORTING & SEARCHING (10) ──────────────────────────────────────

  q("Merge Intervals", "Given an array of intervals where intervals[i] = [start, end], merge all overlapping intervals and return the non-overlapping intervals.", "medium", "Sorting",
    [e("intervals = [[1,3],[2,6],[8,10],[15,18]]", "[[1,6],[8,10],[15,18]]"), e("intervals = [[1,4],[4,5]]", "[[1,5]]")],
    "mergeIntervals", [["intervals", "int[][]"]], "int[][]",
    ["1 ≤ intervals.length ≤ 10^4"], ["Sort by start, then merge overlapping."]),

  q("Kth Largest Element in an Array", "Given an integer array nums and an integer k, return the kth largest element. Note that it is the kth largest in sorted order, not the kth distinct element.", "medium", "Sorting",
    [e("nums = [3,2,1,5,6,4], k = 2", "5"), e("nums = [3,2,3,1,2,4,5,5,6], k = 4", "4")],
    "findKthLargest", [["nums", "int[]"], ["k", "int"]], "int",
    ["1 ≤ k ≤ nums.length ≤ 10^5"], ["Use a min-heap of size k, or quickselect."]),

  q("Top K Frequent Elements", "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.", "medium", "Sorting",
    [e("nums = [1,1,1,2,2,3], k = 2", "[1,2]"), e("nums = [1], k = 1", "[1]")],
    "topKFrequent", [["nums", "int[]"], ["k", "int"]], "int[]",
    ["1 ≤ k ≤ number of unique elements"], ["Count frequencies, then use a heap or bucket sort."]),

  q("Sort Characters By Frequency", "Given a string s, sort it in decreasing order based on the frequency of characters. Characters with the same frequency can be in any order.", "medium", "Sorting",
    [e("s = \"tree\"", "\"eert\""), e("s = \"cccaaa\"", "\"aaaccc\""), e("s = \"Aabb\"", "\"bbAa\"")],
    "frequencySort", [["s", "string"]], "string",
    ["1 ≤ s.length ≤ 5 × 10^5"], ["Count frequency, sort by count, rebuild string."]),

  q("H-Index", "Given an array of citations where citations[i] is the number of citations received, compute the researcher's h-index. A scientist has h-index h if h papers have at least h citations each.", "medium", "Sorting",
    [e("citations = [3,0,6,1,5]", "3"), e("citations = [1,3,1]", "1")],
    "hIndex", [["citations", "int[]"]], "int",
    ["1 ≤ n ≤ 5000"], ["Sort descending, find largest h where citations[h-1] >= h."]),

  q("Find K Closest Elements", "Given a sorted integer array arr, two integers k and x, return the k closest integers to x in the array. The result should be sorted in ascending order.", "medium", "Sorting",
    [e("arr = [1,2,3,4,5], k = 4, x = 3", "[1,2,3,4]"), e("arr = [1,1,2,3,4,5], k = 4, x = -1", "[1,1,2,3]")],
    "findClosestElements", [["arr", "int[]"], ["k", "int"], ["x", "int"]], "int[]",
    ["1 ≤ k ≤ arr.length ≤ 10^4"], ["Binary search for the left bound of the window."]),

  q("Wiggle Sort II", "Given an integer array nums, reorder it such that nums[0] < nums[1] > nums[2] < nums[3] > nums[4] ...", "medium", "Sorting",
    [e("nums = [1,5,1,1,6,4]", "[1,6,1,5,1,4]"), e("nums = [1,3,2,2,3,1]", "[2,3,1,3,1,2]")],
    "wiggleSort", [["nums", "int[]"]], "void",
    ["1 ≤ nums.length ≤ 5 × 10^4"], ["Sort, then interleave smaller and larger halves."]),

  q("Meeting Rooms", "Given an array of meeting time intervals [start, end], determine if a person can attend all meetings (no overlaps).", "easy", "Sorting",
    [e("intervals = [[0,30],[5,10],[15,20]]", "false"), e("intervals = [[7,10],[2,4]]", "true")],
    "canAttendMeetings", [["intervals", "int[][]"]], "bool",
    ["0 ≤ intervals.length ≤ 10^4"], ["Sort by start time, check for overlaps."]),

  q("Meeting Rooms II", "Given an array of meeting time intervals, find the minimum number of conference rooms required.", "medium", "Sorting",
    [e("intervals = [[0,30],[5,10],[15,20]]", "2"), e("intervals = [[7,10],[2,4]]", "1")],
    "minMeetingRooms", [["intervals", "int[][]"]], "int",
    ["1 ≤ intervals.length ≤ 10^4"], ["Sort starts and ends separately, use a sweep line."]),

  q("Insert Interval", "Given a set of non-overlapping intervals sorted by start time and a new interval, insert the new interval and merge if necessary. Return the result sorted.", "medium", "Sorting",
    [e("intervals = [[1,3],[6,9]], newInterval = [2,5]", "[[1,5],[6,9]]"), e("intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]", "[[1,2],[3,10],[12,16]]")],
    "insert", [["intervals", "int[][]"], ["newInterval", "int[]"]], "int[][]",
    ["0 ≤ intervals.length ≤ 10^4"], ["Add non-overlapping before, merge overlapping, add rest."]),

  // ── RECURSION & BACKTRACKING (7) ──────────────────────────────────

  q("Permutations", "Given an array nums of distinct integers, return all possible permutations in any order.", "medium", "Backtracking",
    [e("nums = [1,2,3]", "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]"), e("nums = [0,1]", "[[0,1],[1,0]]")],
    "permute", [["nums", "int[]"]], "int[][]",
    ["1 ≤ nums.length ≤ 6"], ["Backtrack: choose, explore, unchoose."]),

  q("Subsets", "Given an integer array nums of unique elements, return all possible subsets (the power set). No duplicate subsets.", "medium", "Backtracking",
    [e("nums = [1,2,3]", "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]"), e("nums = [0]", "[[],[0]]")],
    "subsets", [["nums", "int[]"]], "int[][]",
    ["1 ≤ nums.length ≤ 10"], ["Include or exclude each element."]),

  q("Combination Sum", "Given an array of distinct integers candidates and a target, return all unique combinations where the chosen numbers sum to target. The same number may be used unlimited times.", "medium", "Backtracking",
    [e("candidates = [2,3,6,7], target = 7", "[[2,2,3],[7]]"), e("candidates = [2,3,5], target = 8", "[[2,2,2,2],[2,3,3],[3,5]]")],
    "combinationSum", [["candidates", "int[]"], ["target", "int"]], "int[][]",
    ["1 ≤ candidates.length ≤ 30"], ["Backtrack allowing repeated picks from current index."]),

  q("Generate Parentheses", "Given n pairs of parentheses, generate all combinations of well-formed parentheses.", "medium", "Backtracking",
    [e("n = 3", "[\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]"), e("n = 1", "[\"()\"]")],
    "generateParenthesis", [["n", "int"]], "string[]",
    ["1 ≤ n ≤ 8"], ["Backtrack with open and close counts."]),

  q("N-Queens", "Place n queens on an n×n chessboard so that no two queens attack each other. Return all distinct solutions. Each solution is a list of strings where 'Q' is a queen and '.' is empty.", "hard", "Backtracking",
    [e("n = 4", "[[\".Q..\",\"...Q\",\"Q...\",\"..Q.\"],[\"..Q.\",\"Q...\",\"...Q\",\".Q..\"]]"), e("n = 1", "[[\"Q\"]]")],
    "solveNQueens", [["n", "int"]], "string[]",
    ["1 ≤ n ≤ 9"], ["Place queens row by row, checking columns and diagonals."]),

  q("Word Search", "Given an m x n board of characters and a string word, return true if word exists in the grid. The word can be constructed from sequentially adjacent cells (horizontally or vertically), without using the same cell twice.", "medium", "Backtracking",
    [e("board = [[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word = \"ABCCED\"", "true"), e("board = [[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word = \"SEE\"", "true")],
    "exist", [["board", "string[]"], ["word", "string"]], "bool",
    ["1 ≤ m, n ≤ 6", "1 ≤ word.length ≤ 15"], ["DFS from each cell matching word[0]."]),

  q("Sudoku Solver", "Write a program to solve a Sudoku puzzle by filling the empty cells (represented as 0). Each row, column, and 3×3 box must contain digits 1-9 exactly once.", "hard", "Backtracking",
    [e("board = [[5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],...]", "solved board")],
    "solveSudoku", [["board", "int[][]"]], "void",
    ["board is 9×9", "1 ≤ board[i][j] ≤ 9 or 0 for empty"], ["Backtrack: try 1-9 in each empty cell, validate."]),

  // ── GREEDY (5) ────────────────────────────────────────────────────

  q("Jump Game II", "Given a 0-indexed array of integers where nums[i] is the max jump length from index i, return the minimum number of jumps to reach the last index.", "medium", "Greedy",
    [e("nums = [2,3,1,1,4]", "2", "Jump to index 1, then to the last index"), e("nums = [2,3,0,1,4]", "2")],
    "jump", [["nums", "int[]"]], "int",
    ["1 ≤ nums.length ≤ 10^4"], ["Track the farthest reachable and current end."]),

  q("Gas Station", "There are n gas stations along a circular route. You have a car with an unlimited tank. Given gas[i] and cost[i] for each station, return the starting station index if you can travel around the circuit once, otherwise return -1.", "medium", "Greedy",
    [e("gas = [1,2,3,4,5], cost = [3,4,5,1,2]", "3"), e("gas = [2,3,4], cost = [3,4,3]", "-1")],
    "canCompleteCircuit", [["gas", "int[]"], ["cost", "int[]"]], "int",
    ["1 ≤ n ≤ 10^5"], ["If total gas >= total cost, a solution exists. Track running surplus."]),

  q("Task Scheduler", "Given an array of tasks represented by characters and a non-negative integer n, find the least number of intervals the CPU needs to finish all tasks. Same tasks must be separated by at least n intervals.", "medium", "Greedy",
    [e("tasks = [\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n = 2", "8"), e("tasks = [\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n = 0", "6")],
    "leastInterval", [["tasks", "string[]"], ["n", "int"]], "int",
    ["1 ≤ tasks.length ≤ 10^4"], ["Count max frequency. Answer = max(len, (maxFreq-1)*(n+1) + countOfMax)."]),

  q("Non-overlapping Intervals", "Given an array of intervals, return the minimum number of intervals you need to remove to make the rest non-overlapping.", "medium", "Greedy",
    [e("intervals = [[1,2],[2,3],[3,4],[1,3]]", "1"), e("intervals = [[1,2],[1,2],[1,2]]", "2")],
    "eraseOverlapIntervals", [["intervals", "int[][]"]], "int",
    ["1 ≤ intervals.length ≤ 10^5"], ["Sort by end, greedily keep non-overlapping."]),

  q("Partition Labels", "Given a string s, partition it so each letter appears in at most one part. Return a list of integers representing the size of each part.", "medium", "Greedy",
    [e("s = \"ababcbacadefegdehijhklij\"", "[9,7,8]"), e("s = \"eccbbbbdec\"", "[10]")],
    "partitionLabels", [["s", "string"]], "int[]",
    ["1 ≤ s.length ≤ 500"], ["Record last occurrence of each char, expand partition boundaries."]),

  // ── HASH MAP (5) ──────────────────────────────────────────────────

  q("Two Sum (Hash Map)", "Given an array of integers and a target, return indices of two numbers that add up to target. Use a hash map for O(n) solution.", "easy", "Hash Map",
    [e("nums = [2,7,11,15], target = 9", "[0,1]"), e("nums = [3,3], target = 6", "[0,1]")],
    "twoSumHash", [["nums", "int[]"], ["target", "int"]], "int[]",
    ["2 ≤ nums.length ≤ 10^4"], ["Store {value: index} as you iterate."]),

  q("Longest Consecutive Sequence", "Given an unsorted array of integers, find the length of the longest consecutive elements sequence. Run in O(n) time.", "medium", "Hash Map",
    [e("nums = [100,4,200,1,3,2]", "4", "Sequence: [1,2,3,4]"), e("nums = [0,3,7,2,5,8,4,6,0,1]", "9")],
    "longestConsecutive", [["nums", "int[]"]], "int",
    ["0 ≤ nums.length ≤ 10^5"], ["Use a set. For each number not having num-1 in set, count consecutive."]),

  q("Valid Sudoku", "Determine if a 9 x 9 Sudoku board is valid. Only filled cells need to be validated: each row, column, and 3x3 box must contain digits 1-9 without repetition.", "medium", "Hash Map",
    [e("board (valid example)", "true"), e("board (invalid example)", "false")],
    "isValidSudoku", [["board", "string[]"]], "bool",
    ["board.length == 9", "board[i].length == 9"], ["Use sets for each row, column, and 3×3 box."]),

  q("Isomorphic Strings", "Given two strings s and t, determine if they are isomorphic. Two strings are isomorphic if the characters in s can be replaced to get t (preserving order, with a consistent mapping).", "easy", "Hash Map",
    [e("s = \"egg\", t = \"add\"", "true"), e("s = \"foo\", t = \"bar\"", "false"), e("s = \"paper\", t = \"title\"", "true")],
    "isIsomorphic", [["s", "string"], ["t", "string"]], "bool",
    ["1 ≤ s.length ≤ 5 × 10^4", "s.length == t.length"], ["Use two maps for bidirectional mapping."]),

  q("Word Pattern", "Given a pattern and a string s, determine if s follows the same pattern. Pattern 'abba' with 'dog cat cat dog' returns true.", "easy", "Hash Map",
    [e("pattern = \"abba\", s = \"dog cat cat dog\"", "true"), e("pattern = \"abba\", s = \"dog cat cat fish\"", "false")],
    "wordPattern", [["pattern", "string"], ["s", "string"]], "bool",
    ["1 ≤ pattern.length ≤ 300"], ["Map each char to a word and each word to a char."]),

  // ── HEAP / PRIORITY QUEUE (3) ─────────────────────────────────────

  q("Find Median from Data Stream", "Design a data structure that supports adding integers and finding the median of all elements added so far.", "hard", "Heap",
    [e("addNum(1), addNum(2), findMedian() -> 1.5, addNum(3), findMedian() -> 2.0", "Median updates as numbers are added")],
    "MedianFinder", [], "void",
    [], ["Use a max-heap for the lower half and a min-heap for the upper half."]),

  q("Merge K Sorted Lists", "Given an array of k sorted arrays, merge them into one sorted array.", "hard", "Heap",
    [e("lists = [[1,4,5],[1,3,4],[2,6]]", "[1,1,2,3,4,4,5,6]"), e("lists = []", "[]")],
    "mergeKLists", [["lists", "int[][]"]], "int[]",
    ["0 ≤ k ≤ 10^4"], ["Use a min-heap to always pick the smallest head."]),

  q("Last Stone Weight", "You have a collection of stones with positive integer weights. Each turn, pick the two heaviest stones and smash them. Return the weight of the last remaining stone (or 0 if none).", "easy", "Heap",
    [e("stones = [2,7,4,1,8,1]", "1"), e("stones = [1]", "1")],
    "lastStoneWeight", [["stones", "int[]"]], "int",
    ["1 ≤ stones.length ≤ 30"], ["Use a max-heap, repeatedly smash top two."]),
];
