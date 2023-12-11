# Database Collection Schema

## User Collection

- `UserID` (Primary Key)
- `Username`
- `Password` (hashed)
- `Email`
- `ImageURL`
- `Title`
- `Description`

## Connection Collection

- `ConnectionID` (Primary Key)
- `SenderUserID` (Foreign Key referencing User.UserID)
- `ReceiverUserID` (Foreign Key referencing User.UserID)
- `Status` (Pending, Accepted, Rejected)

## UserConnections Collection (to manage many-to-many relationships)

- `UserConnectionID` (Primary Key)
- `UserID` (Foreign Key referencing User.UserID)
- `ConnectionID` (Foreign Key referencing Connection.ConnectionID)

## Feed Collection

- `FeedID` (Primary Key)
- `UserID` (Foreign Key referencing User.UserID)
- `Text`
- `ImageURL`
- `Timestamp`

## ProfileHistory Collection

- `ProfileHistoryID` (Primary Key)
- `UserID` (Foreign Key referencing User.UserID)
- `employment history`
