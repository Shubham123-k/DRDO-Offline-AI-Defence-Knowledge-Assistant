from sqlalchemy import text
from database.db import engine


def migrate_conversations():

    with engine.connect() as connection:

        result = connection.execute(
            text(
                "PRAGMA table_info(conversations)"
            )
        )

        columns = [
            row[1]
            for row in result
        ]

        print("\nExisting columns:")
        print(columns)

        if "updated_at" not in columns:

            print(
                "\nAdding updated_at column..."
            )

            connection.execute(
                text(
                    """
                    ALTER TABLE conversations
                    ADD COLUMN updated_at DATETIME
                    """
                )
            )

            connection.commit()

            print(
                "updated_at column added successfully."
            )

        else:

            print(
                "\nupdated_at already exists."
            )

        connection.execute(
            text(
                """
                UPDATE conversations
                SET updated_at = created_at
                WHERE updated_at IS NULL
                """
            )
        )

        connection.commit()

        print(
            "Existing conversations updated."
        )


if __name__ == "__main__":
    migrate_conversations()
    print(
        "\nMigration completed successfully."
    )