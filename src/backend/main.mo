import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";

actor {
  type ClothingItem = {
    id : Nat;
    name : Text;
    category : Text;
    imageUrl : Text;
  };

  let clothingItems = Map.empty<Nat, ClothingItem>();

  let initialItems : [(Nat, ClothingItem)] = [
    (
      1,
      {
        id = 1;
        name = "Floral Dress";
        category = "dress";
        imageUrl = "https://example.com/dress1.png";
      },
    ),
    (
      2,
      {
        id = 2;
        name = "Denim Jacket";
        category = "top";
        imageUrl = "https://example.com/top1.png";
      },
    ),
    (
      3,
      {
        id = 3;
        name = "Pleated Skirt";
        category = "skirt";
        imageUrl = "https://example.com/skirt1.png";
      },
    ),
  ];

  // Seed initial items at deployment
  switch (clothingItems.isEmpty()) {
    case (true) {
      for ((id, item) in initialItems.values()) {
        clothingItems.add(id, item);
      };
    };
    case (false) {};
  };

  public query ({ caller }) func getAllItems() : async [ClothingItem] {
    clothingItems.values().toArray();
  };

  public query ({ caller }) func getItemsByCategory(category : Text) : async [ClothingItem] {
    switch (category) {
      case ("") { Runtime.trap("Category cannot be empty") };
      case (_) {
        clothingItems.values().toArray().filter(
          func(item) {
            Text.equal(item.category, category);
          }
        );
      };
    };
  };

  public query ({ caller }) func getItemById(id : Nat) : async ClothingItem {
    switch (clothingItems.get(id)) {
      case (null) { Runtime.trap("Item with id " # id.toText() # " not found") };
      case (?item) { item };
    };
  };
};
